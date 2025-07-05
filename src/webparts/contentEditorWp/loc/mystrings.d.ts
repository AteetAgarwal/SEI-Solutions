declare interface IContentEditorWpWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  TitleFieldLabel: string;
  RemovePaddingFieldLabel: string;
  SPPageContextInfoFieldLabel: string;
}

declare module 'ContentEditorWpWebPartStrings' {
  const strings: IContentEditorWpWebPartStrings;
  export = strings;
}
