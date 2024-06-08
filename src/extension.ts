// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

let lastSaved: { gotDirtyAt: number; document: vscode.TextDocument }[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  watchForDirtyFiles();
}

const watchForDirtyFiles = () => {
  setInterval(() => {
    const docs = vscode.workspace.textDocuments;

    for (const doc of docs) {
      const saved = lastSaved.find((s) => s.document.fileName === doc.fileName);
      if (!saved && !doc.isDirty) {
        continue;
      }

      if (saved && doc.isDirty && !doc.isUntitled) {
        const delta = new Date().valueOf() - saved.gotDirtyAt;

        if (delta > 30000) {
          doc.save();
          vscode.window.showInformationMessage(
            `YOU DIDN'T SAVE YOUR FILE ${doc.fileName}!`,
            "I understand",
            "I'm deeply sorry",
            "It won't happen again"
          );
        }
      }

      if (!saved && doc.isDirty && !doc.isUntitled && !isActiveDoc(doc)) {
        lastSaved.push({
          gotDirtyAt: new Date().valueOf(),
          document: doc,
        });
      }

      if ((saved && !doc.isDirty) || (saved && isActiveDoc(doc))) {
        lastSaved = lastSaved.filter(
          (d) => d.document.fileName !== doc.fileName
        );
      }
    }
  }, 1000);
};

const isActiveDoc = (doc: vscode.TextDocument) => {
  return doc.fileName === vscode.window.activeTextEditor?.document.fileName;
};

// This method is called when your extension is deactivated
export function deactivate() {}
