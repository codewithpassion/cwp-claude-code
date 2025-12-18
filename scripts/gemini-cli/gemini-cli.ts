#!/usr/bin/env ts-node

/**
 * gemini-cli wrapper for Claude subagents (TypeScript).
 *
 * Usage (stdin mode):
 *   echo '<payload-json>' | gemini-cli --task "architecture_review" --stdin
 *
 * Requirements:
 *   - Node.js
 *   - ts-node (or precompile with tsc and run via node)
 *   - Official `gemini` CLI installed and authenticated, on PATH.
 */

import { spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

type Payload = {
    task?: string;
    natural_language_request?: string;
    selected_files?: { path?: string; snippet?: string }[];
    constraints?: Record<string, unknown>;
    [key: string]: unknown;
};

type GeminiRawResponse = {
    model?: string;
    task?: string;
    analysis?: string;
    suggestions?: string[] | string;
    notes?: string;
    response?: string;
    [key: string]: unknown;
};

type NormalizedOutput = {
    model: "gemini";
    task: string;
    analysis: string;
    suggestions: string[];
    notes: string;
    normalized: {
        chosen_model: "gemini";
        task: string;
        summary: string;
        proposed_changes: string[];
        warnings: string[];
        raw_model_notes: string;
    };
};

function parseArgs(argv: string[]) {
    const args: {
        task?: string;
        stdin?: boolean;
        model?: string;
    } = {};

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--task") {
            args.task = argv[i + 1];
            i++;
        } else if (arg === "--stdin") {
            args.stdin = true;
        } else if (arg === "--model") {
            args.model = argv[i + 1];
            i++;
        }
    }

    if (!args.task) {
        console.error("Error: --task is required.");
        process.exit(1);
    }

    if (!args.stdin) {
        console.error("Error: this wrapper currently only supports --stdin mode.");
        process.exit(1);
    }

    if (!args.model) {
        args.model = "gemini-2.5-flash";
    }

    return args as { task: string; stdin: true; model: string };
}

function readPayloadFromStdin(): Payload {
    const data = fs.readFileSync(0, "utf8"); // fd 0 = stdin
    if (!data.trim()) {
        console.error("Error: no stdin data received.");
        process.exit(1);
    }

    try {
        return JSON.parse(data);
    } catch (err) {
        console.error("Error: invalid JSON on stdin:", err);
        process.exit(1);
    }
}

function buildPrompt(task: string, payload: Payload): string {
    const nlReq = payload.natural_language_request ?? "";
    const selectedFiles = payload.selected_files ?? [];
    const constraints = payload.constraints ?? {};

    const lines: string[] = [];

    lines.push(`Task: ${task}`);

    if (nlReq) {
        lines.push("");
        lines.push("User request:");
        lines.push(nlReq);
    }

    if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
        lines.push("");
        lines.push("Relevant files/snippets:");
        for (const f of selectedFiles) {
            const path = f.path ?? "unknown path";
            const snippet = (f.snippet ?? "").toString().trim();
            lines.push(`\nFile: ${path}\n---\n${snippet}\n---`);
        }
    }

    const constraintsKeys = Object.keys(constraints);
    if (constraints && constraintsKeys.length > 0) {
        lines.push("");
        lines.push("Constraints / preferences:");
        for (const key of constraintsKeys) {
            const value = constraints[key];
            lines.push(`- ${key}: ${value}`);
        }
    }

    lines.push("");
    lines.push(
        "Return a concise analysis, concrete suggestions, and any important warnings. " +
        "Focus on actionable recommendations."
    );

    return lines.join("\n");
}

function callGeminiCli(model: string, prompt: string): string {
    const cmd = "gemini";
    const args = ["-p", prompt, "--model", model, "--output-format", "json"];

    const result = spawnSync(cmd, args, {
        encoding: "utf8",
    });

    if (result.error) {
        const errObj = {
            model: "gemini",
            task: "error",
            error: `Failed to spawn gemini CLI: ${result.error.message}`,
        };
        console.log(JSON.stringify(errObj));
        process.exit(0);
    }

    if (result.status !== 0) {
        const stderr = (result.stderr || "").toString().trim();
        const errMsg = stderr || `gemini CLI exited with code ${result.status}`;
        const errObj = {
            model: "gemini",
            task: "error",
            error: `gemini CLI failed: ${errMsg}`,
        };
        console.log(JSON.stringify(errObj));
        process.exit(0);
    }

    return result.stdout || "";
}

function normalizeOutput(task: string, raw: GeminiRawResponse): NormalizedOutput {
    let analysis =
        raw.analysis ??
        raw.response ??
        "";
    if (typeof analysis !== "string") {
        analysis = String(analysis);
    }

    let suggestions = raw.suggestions ?? [];
    if (typeof suggestions === "string") {
        suggestions = [suggestions];
    }
    if (!Array.isArray(suggestions)) {
        suggestions = [String(suggestions)];
    }

    const notes = typeof raw.notes === "string" ? raw.notes : "";

    let summary = analysis.trim();
    if (summary.length > 2000) {
        summary = summary.slice(0, 2000) + " ...[truncated]";
    }

    return {
        model: "gemini",
        task,
        analysis,
        suggestions,
        notes,
        normalized: {
            chosen_model: "gemini",
            task,
            summary,
            proposed_changes: suggestions,
            warnings: [],
            raw_model_notes: notes,
        },
    };
}

function ensureLogDirectory(): string {
    const logDir = path.join(os.homedir(), ".gemini-cli-bridge-logs");
    try {
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    } catch (err) {
        // Silently fail if we can't create the log directory
        console.error(`Warning: Could not create log directory: ${err}`);
    }
    return logDir;
}

function writeLog(
    logDir: string,
    argv: string[],
    payload: Payload,
    output: NormalizedOutput
): void {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const logFile = path.join(logDir, `gemini-cli-${timestamp}.json`);

        const logEntry = {
            timestamp: new Date().toISOString(),
            commandLine: argv,
            input: payload,
            output: output,
        };

        fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2), "utf8");
    } catch (err) {
        // Silently fail if we can't write the log
        console.error(`Warning: Could not write log file: ${err}`);
    }
}

function main() {
    const argv = process.argv.slice(2);
    const args = parseArgs(argv);
    const payload = readPayloadFromStdin();
    const prompt = buildPrompt(args.task, payload);

    const rawOut = callGeminiCli(args.model, prompt);

    let parsed: GeminiRawResponse;
    try {
        parsed = JSON.parse(rawOut);
    } catch {
        parsed = { response: rawOut };
    }

    const normalized = normalizeOutput(args.task, parsed);

    // Log the execution
    const logDir = ensureLogDirectory();
    writeLog(logDir, argv, payload, normalized);

    process.stdout.write(JSON.stringify(normalized));
}

main();
