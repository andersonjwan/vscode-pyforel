import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	TextDocumentSyncKind,
	InitializeResult,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// create a connection for the server using Node's IPC as a transport
// include all previw/proposed LSP features
const connection = createConnection(ProposedFeatures.all);

// create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
    const capabilities = params.capabilities;

    // check if the client supports the `workspace/configuration` request
    // if not, global settings are used
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );

    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // feature: code completion
            completionProvider: {
                resolveProvider: true
            }
        }
    };

    if(hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        }
    };

    return result;
});

connection.onInitialized(() => {
    if(hasConfigurationCapability) {
        // register for all configuration changes
        connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }

    if(hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change even received.');
        });
    }
});

interface ExampleSettings {
    maxNumberOfProblems: number;
}

// set the global settings to default if `workspace/configuration` is not supported
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    if(hasConfigurationCapability) {
        // reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = <ExampleSettings>(
            (change.settings.languageServerPyforel|| defaultSettings)
        );
    }
});

// keep document settings for open documents only
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

connection.onDidChangeWatchedFiles(_change => {
	// monitored files have change in VSCode
	connection.console.log('<EVENT> File changed received.');
});

// AUTOCOMPLETION
connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        return [
            {
                label: 'if',
                kind: CompletionItemKind.Keyword,
                data: 1
            },
            {
                label: 'elif',
                kind: CompletionItemKind.Keyword,
                data: 2
            },
            {
                label: 'else',
                kind: CompletionItemKind.Keyword,
                data: 3
            },
            {
                label: 'verb',
                kind: CompletionItemKind.Keyword,
                data: 4
            },
            {
                label: 'and',
                kind: CompletionItemKind.Keyword,
                data: 5
            },
            {
                label: 'or',
                kind: CompletionItemKind.Keyword,
                data: 6
            },
            {
                label: 'not',
                kind: CompletionItemKind.Keyword,
                data: 7
            },
            {
                label: 'exists',
                kind: CompletionItemKind.Operator,
                data: 8
            },
            {
                label: 'forall',
                kind: CompletionItemKind.Operator,
                data: 9
            },
            {
                label: 'at',
                kind: CompletionItemKind.Keyword,
                data: 10
            },
            {
                label: 'release',
                kind: CompletionItemKind.Operator,
                data: 11
            },
            {
                label: 'until',
                kind: CompletionItemKind.Operator,
                data: 12
            },
            {
                label: 'with',
                kind: CompletionItemKind.Keyword,
                data: 13
            },
            {
                label: 'eventually',
                kind: CompletionItemKind.Operator,
                data: 14
            },
            {
                label: 'globally',
                kind: CompletionItemKind.Operator,
                data: 15
            },
            {
                label: 'next',
                kind: CompletionItemKind.Operator,
                data: 16
            },
            {
                label: 'from',
                kind: CompletionItemKind.Keyword,
                data: 17
            },
            {
                label: 'func',
                kind: CompletionItemKind.Keyword,
                data: 18
            },
            {
                label: 'object',
                kind: CompletionItemKind.TypeParameter,
                data: 19
            },
            {
                label: 'time',
                kind: CompletionItemKind.TypeParameter,
                data: 20
            },
            {
                label: 'frame',
                kind: CompletionItemKind.TypeParameter,
                data: 21
            },
            {
                label: 'const',
                kind: CompletionItemKind.TypeParameter,
                data: 22
            },
            {
                label: 'true',
                kind: CompletionItemKind.Constant,
                data: 23
            },
            {
                label: 'false',
                kind: CompletionItemKind.Constant,
                data: 24
            }
        ];
    }
);

connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        return item;
    }
);

// make the test document manager listen on the connection
// for open, change, and close events
documents.listen(connection);

// listen on the connection
connection.listen();