import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version, DisplayMode } from '@microsoft/sp-core-library';
import { SPComponentLoader } from '@microsoft/sp-loader';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneToggle,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'ContentEditorWpWebPartStrings';
import ContentEditorWp from './components/ContentEditorWp';
import { IContentEditorWpProps } from './components/IContentEditorWpProps';

export interface IContentEditorWpWebPartProps {
  script: string;
  title: string;
  removePadding: boolean;
  spPageContextInfo: boolean;
}

export default class ContentEditorWpWebPart extends BaseClientSideWebPart<IContentEditorWpWebPartProps> {

  public save: (script: string) => void = (script: string) => {
    this.properties.script = script;
    this.render();
  }

  public render(): void {
    if (this.displayMode == DisplayMode.Read) {
      if (this.properties.removePadding) {
          let element = this.domElement.parentElement;
          // check up to 5 levels up for padding and exit once found
          for (let i = 0; i < 5; i++) {
              const style = window.getComputedStyle(element);
              const hasPadding = style.paddingTop !== "0px";
              if (hasPadding) {
                  element.style.paddingTop = "0px";
                  element.style.paddingBottom = "0px";
                  element.style.marginTop = "0px";
                  element.style.marginBottom = "0px";
              }
              element = element.parentElement;
          }
      }
      this.domElement.innerHTML = this.properties.script;
      this.executeScript(this.domElement);
    } 
    else {
      this.renderEditor();
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("title", {
                    label:  strings.TitleFieldLabel,
                    value: this.properties.title
                }),
                PropertyPaneToggle("removePadding", {
                    label: strings.RemovePaddingFieldLabel,
                    checked: this.properties.removePadding,
                    onText: "Remove padding",
                    offText: "Keep padding"
                }),
                PropertyPaneToggle("spPageContextInfo", {
                    label: strings.SPPageContextInfoFieldLabel,
                    checked: this.properties.spPageContextInfo,
                    onText: "Enabled",
                    offText: "Disabled"
                })]
           }]
         }
      ]
   }
 }

protected get disableReactivePropertyChanges(): boolean { 
  return true; 
}

private async renderEditor(){
  const editorPopUp = await import(
      './components/ContentEditorWp'
  );
  const element: React.ReactElement<IContentEditorWpProps> = React.createElement(
      editorPopUp.default,
      {
          script: this.properties.script,
          title: this.properties.title,
          save: this.save
      }
  );
  ReactDom.render(element, this.domElement);
}

private evalScript(elem) {
  const data = (elem.text || elem.textContent || elem.innerHTML || "");
  const headTag = document.getElementsByTagName("head")[0] || document.documentElement;
  const scriptTag = document.createElement("script");

  scriptTag.type = "text/javascript";
  if (elem.src && elem.src.length > 0) {
      return;
  }
  if (elem.onload && elem.onload.length > 0) {
      scriptTag.onload = elem.onload;
  }

  try {
      // doesn't work on ie...
      scriptTag.appendChild(document.createTextNode(data));
  } catch (e) {
      // IE has funky script nodes
      scriptTag.text = data;
  }

  headTag.insertBefore(scriptTag, headTag.firstChild);
  headTag.removeChild(scriptTag);
}

private nodeName(elem, name) {
  return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
}

private async executeScript(element: HTMLElement) {
  if (this.properties.spPageContextInfo && !window["_spPageContextInfo"]) {
    window["_spPageContextInfo"] = this.context.pageContext.legacyPageContext;
  }
  (<any>window).ScriptGlobal = {};
  const scripts = [];
  const children_nodes = element.childNodes;

  for (let i = 0; children_nodes[i]; i++) {
      const child: any = children_nodes[i];
      if (this.nodeName(child, "script") &&
          (!child.type || child.type.toLowerCase() === "text/javascript")) {
          scripts.push(child);
      }
  }

  const urls = [];
  const onLoads = [];
  for (let i = 0; scripts[i]; i++) {
      const scriptTag = scripts[i];
      if (scriptTag.src && scriptTag.src.length > 0) {
          urls.push(scriptTag.src);
      }
      if (scriptTag.onload && scriptTag.onload.length > 0) {
          onLoads.push(scriptTag.onload);
      }
  }

  let oldamd = null;
  if (window["define"] && window["define"].amd) {
      oldamd = window["define"].amd;
      window["define"].amd = null;
  }


  for (let i = 0; i < urls.length; i++) {
      try {
          let scriptUrl = urls[i];
          const prefix = scriptUrl.indexOf('?') === -1 ? '?' : '&';
          scriptUrl += prefix + 'cow=' + new Date().getTime();
          await SPComponentLoader.loadScript(scriptUrl, { globalExportsName: "ScriptGlobal" });
      } catch (error) {
          if (console.error) {
              console.error(error);
          }
      }
  }
  if (oldamd) {
      window["define"].amd = oldamd;
  }

  for (let i = 0; scripts[i]; i++) {
      const scriptTag = scripts[i];
      if (scriptTag.parentNode) { scriptTag.parentNode.removeChild(scriptTag); }
      this.evalScript(scripts[i]);
  }
  // execute any onload people have added
  for (let i = 0; onLoads[i]; i++) {
      onLoads[i]();
  }
}
}
