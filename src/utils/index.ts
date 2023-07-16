

export enum NamingCase {
    CamelCase = "CamelCase",
    PascalCase = "PascalCase",
    SnakeCase = "SnakeCase",
    UpperCase = "UpperCase",
    LowerCase = "LowerCase",
    KebabCase = "KebabCase",
    StartCase = "StartCase",
    DotCase = "DotCase",
    PathCase = "PathCase",
    SpaceCase = "SpaceCase",
    NoCase = "NoCase",
    ConstantCase = "ConstantCase",
    SentenceCase = "SentenceCase",
    Unknown = "Unknown"
}



export const NamingCases: Record<NamingCase, RegExp> = {
    [NamingCase.CamelCase]: /^[a-z][a-zA-Z0-9]*$/,
    [NamingCase.PascalCase]: /^[A-Z][a-zA-Z0-9]*$/,
    [NamingCase.SnakeCase]: /^[a-z][a-z0-9_]*$/,
    [NamingCase.UpperCase]: /^[A-Z][A-Z0-9]*$/,
    [NamingCase.LowerCase]: /^[a-z][a-z0-9]*$/,
    [NamingCase.KebabCase]: /^[a-z][a-z0-9-]*$/,
    [NamingCase.StartCase]: /^[A-Z][a-z0-9 ]*$/,
    [NamingCase.DotCase]: /^[a-z][a-z0-9.]*$/,
    [NamingCase.PathCase]: /^[a-z][a-z0-9/]*$/,
    [NamingCase.SpaceCase]: /^[a-z][a-z0-9 ]*$/,
    [NamingCase.NoCase]: /^[a-z][a-z0-9]*$/,
    [NamingCase.ConstantCase]: /^[A-Z][A-Z0-9_]*$/,
    [NamingCase.SentenceCase]: /^[A-Z][a-z0-9 ]*$/,
    [NamingCase.Unknown]: /^.*$/
}

export const NamingCasesArray = Object.entries(NamingCases).map(([type, regexp]) => ({
    regexp,
    type: type as NamingCase
}))

export const controlCase = (str: string, caseType: NamingCase) => NamingCases[caseType].test(str)

export const whatCase = (str: string) => NamingCasesArray.find(({ regexp }) => regexp.test(str))?.type || NamingCase.Unknown