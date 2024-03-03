import * as vscode from "vscode"
import DependencyPicker from "./dependencyPicker"
import { extractSpringBootVersion, findDependenciesBlockPosition, makeDependencyStatement } from "./util"

const DEFAULT_SERVICE_URL = "https://start.spring.io"

const DEPENDENCY_INSERT_WARN = `// NOTE: The following dependencies were automatically added by the [Gradle Plus] extension.
// Please review them to ensure they match your project's requirements.`

export function activate(context: vscode.ExtensionContext) {
    console.log(' "spring-boot-gradle-plus" is now active!')

    let disposable = vscode.commands.registerCommand("gradle.project.addDependency", async () => {
        const gradleFile = await vscode.workspace.findFiles("**/build.gradle")

        const gradleFileDocument = await vscode.workspace.openTextDocument(gradleFile[0])

        const picker = new DependencyPicker()

        const currentSpringVersion = extractSpringBootVersion(gradleFileDocument.getText())

        const blockPosition = await findDependenciesBlockPosition(gradleFileDocument)

        picker.show()
        picker.loadItems(`${DEFAULT_SERVICE_URL}/dependencies?bootVersion=${currentSpringVersion}`)

        await new Promise((resolve) => {
            const disposable = picker.dependencyPicker.onDidAccept(async () => {
                const selectedItems = picker.getSelectedItems()
                console.log(selectedItems)

                if (selectedItems.length !== 0) {
                    const dependencyStatement: string[] = selectedItems.map((item) => makeDependencyStatement({ artifactId: item.label, groupId: item.detail!, scope: item.description! }))
                    const gradleFileEditor = await vscode.window.showTextDocument(gradleFile[0])

                    gradleFileEditor
                        .edit((editBuilder) => {
                            editBuilder.insert(blockPosition!.endPosition, `\n${DEPENDENCY_INSERT_WARN}\n${dependencyStatement.join("\n")}\n`)
                        })
                        .then((success) => {
                            if (success) {
                                gradleFileDocument.save()
                                vscode.window.showInformationMessage("의존성이 성공적으로 추가되었습니다.")
                            }
                        })
                } else {
                    vscode.window.showInformationMessage("선택된 의존성이 없습니다.")
                }

                picker.dispose()
                resolve(undefined)
            })
            context.subscriptions.push(disposable)
        })
    })

    context.subscriptions.push(disposable)
}

export function deactivate() {}
