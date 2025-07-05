import * as React from 'react';
import styles from './ContentEditorWp.module.scss';
import { IContentEditorWpProps } from './IContentEditorWpProps';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { loadStyles } from '@microsoft/load-themed-styles';
require('./override.css');

export default class ContentEditorWp extends React.Component < IContentEditorWpProps, any > {
  constructor() {
    super();
    this.showDialog = this.showDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.cancelDialog = this.cancelDialog.bind(this);
    this.onScriptEditorTextChanged = this.onScriptEditorTextChanged.bind(this);

    const uiFabricCSS: string = `.pzl-bgColor-themeDark, .pzl-bgColor-themeDark--hover:hover {
                                                  background-color: "[theme:themeDark, default:#005a9e]";
                                                  }`;
      loadStyles(uiFabricCSS);
      this.state = {
          showDialog: false
      };
  }

  public componentDidMount(): void {
    this.setState({ script: this.props.script, loaded: this.props.script });
  }

  public render(): React.ReactElement<IContentEditorWpProps> {
    //const viewMode = <span dangerouslySetInnerHTML={{ __html: this.state.script }}></span>;
    return(
      <div >
        <div className={styles.contentEditor}>
            <div className={styles.container}>
                <div className={`ms-Grid-row pzl-bgColor-themeDark ms-fontColor-white ${styles.row}`}>
                    <div className="ms-Grid-col ms-lg10 ms-xl8 ms-xlPush2 ms-lgPush1">
                        <span className="ms-font-xl ms-fontColor-white">{this.props.title}</span>
                        <p className="ms-font-l ms-fontColor-white"></p>
                        <DefaultButton description='Opens the snippet dialog' onClick={this.showDialog}>Edit snippet</DefaultButton>
                    </div>
                </div>
            </div>
        </div>
        <Dialog
            isOpen={this.state.showDialog}
            type={DialogType.normal}
            onDismiss={this.closeDialog}
            title='Embed'
            subText='Paste your script, markup or embed code below. Note that scripts will only run in view mode.'
            isBlocking={true}
            className={'ScriptPart'}>
            <TextField multiline rows={15} onChanged={this.onScriptEditorTextChanged} value={this.state.script} />
            <DialogFooter>
                <PrimaryButton onClick={this.closeDialog}>Save</PrimaryButton>
                <DefaultButton onClick={this.cancelDialog}>Cancel</DefaultButton>
            </DialogFooter>
            {/* {viewMode}  */}
        </Dialog>
      </div >
    );
  }

  private showDialog() {
    this.setState({ showDialog: true });
  }

  private closeDialog() {
      this.setState({ showDialog: false });
      this.props.save(this.state.script);
  }

  private cancelDialog() {
      this.props.save(this.state.loaded);
      this.setState({ showDialog: false, script: this.state.loaded });
  }

  private onScriptEditorTextChanged(text: string) {
      this.setState({ script: text });
  }
}
