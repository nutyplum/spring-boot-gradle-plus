import * as vscode from "vscode"
import * as https from "https"

export async function getHttpsResponsePromise(url: string): Promise<IResponseSpringInitializr> {
    return new Promise((resolve, reject) => {
        https
            .get(url, (response) => {
                let data = ""
                response.on("data", (chunk) => (data += chunk))
                response.on("end", () => {
                    try {
                        resolve(JSON.parse(data)) // 문자열을 JSON으로 파싱하여 반환
                    } catch (error) {
                        reject(error) // 파싱 중 에러 처리
                    }
                })
            })
            .on("error", (err) => reject(err))
    })
}

export async function findDependenciesBlockPosition(document: vscode.TextDocument): Promise<{ startPosition: vscode.Position; endPosition: vscode.Position } | undefined> {
    const documentText = document.getText()
    const dependenciesBlockStart = documentText.indexOf("dependencies {")
    if (dependenciesBlockStart === -1) {
        vscode.window.showErrorMessage("dependencies 블록을 찾을 수 없습니다.")
        return undefined
    }

    const dependenciesBlockEnd = documentText.indexOf("}", dependenciesBlockStart)
    if (dependenciesBlockEnd === -1) {
        vscode.window.showErrorMessage("dependencies 블록의 끝을 찾을 수 없습니다.")
        return undefined
    }

    const startPosition = document.positionAt(dependenciesBlockStart)
    const endPosition = document.positionAt(dependenciesBlockEnd)

    return { startPosition, endPosition }
}

export const DependencyScope: DependencyScopeType = {
    compile: "implementation",
    runtime: "runtimeOnly",
    test: "testImplementation",
    provided: "compileOnly",
    development: "developmentOnly",
    annotationProcessor: "annotationProcessor",
}

export function makeDependencyStatement(item: IResponseDependency): string {
    return `\t${DependencyScope[item.scope]} '${item.groupId}:${item.artifactId}'`
}

export function extractSpringBootVersion(gradleFileContents: string): string | undefined {
    const pattern = /org\.springframework\.boot'\s+version\s+'([\d.]+)'/
    const matches = gradleFileContents.match(pattern)

    if (matches && matches.length > 1) {
        return matches[1]
    } else {
        return undefined
    }
}
