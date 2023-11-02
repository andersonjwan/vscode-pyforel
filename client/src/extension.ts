import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
    LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(ctx: ExtensionContext) {
    // implement a server in node
    let serverModule = ctx.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );

    // set the debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode, so VSCode can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // if server ran in debug mode, then the debug options are used;
    // otherwise, the server is ran normally
    let serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    // set options for the language client
    let clientOptions: LanguageClientOptions = {
        // register the server for pyforel requirement documents
        documentSelector: [{ scheme: 'file', language: 'pyforel' }],
        synchronize: {
            // notify the server about files changes to '.clientrc files within the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    }

    // create the language client
    client = new LanguageClient(
        'languageServerPyforel',
        serverOptions,
        clientOptions
    );

    // start the client and launch the server
    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if(!client) {
        return undefined;
    }

    return client.stop();
}