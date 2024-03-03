import { window, QuickPickItem, QuickInputButtons, ThemeIcon } from "vscode"

import { getHttpsResponsePromise } from "./util"

class DependencyPicker {
    public dependencyPicker = window.createQuickPick<QuickPickItem>()

    constructor() {
        this.dependencyPicker.canSelectMany = true
        this.dependencyPicker.items = []
        this.dependencyPicker.title = "Add Dependencies"
        this.dependencyPicker.placeholder = "Search for Dependency..."
        this.dependencyPicker.busy = true
    }

    public async loadItems(url: string): Promise<void> {
        try {
            const data = await getHttpsResponsePromise(url)
            this.dependencyPicker.items = this.createDependenciesItem(data.dependencies)
        } catch (error) {
            console.error(error)
        } finally {
            this.dependencyPicker.busy = false
        }
    }

    public show() {
        this.dependencyPicker.show()
    }

    public getSelectedItems(): QuickPickItem[] {
        return [...this.dependencyPicker.selectedItems]
    }

    public dispose() {
        this.dependencyPicker.dispose()
    }

    private createDependenciesItem(data: IResponseDependencies): QuickPickItem[] {
        const pickerItems: QuickPickItem[] = Object.entries(data).map(([key, value]) => {
            return { label: value.artifactId, picked: false, detail: value.groupId, description: value.scope }
        })
        return pickerItems
    }
}

export default DependencyPicker
