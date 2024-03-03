interface IResponseDependency {
    groupId: string
    artifactId: string
    scope: string
    bom?: string
}

interface IResponseDependencies {
    [key: string]: IResponseDependency
}

interface IResponseSpringInitializr {
    bootVersion: string
    dependencies: IResponseDependencies
}

type DependencyScopeType = {
    [key: string]: string
}
