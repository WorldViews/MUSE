import React from 'react';
import {styles} from './styles.scss';
import RaisedButton from 'material-ui/RaisedButton';

import Editor from 'jsoneditor';

export default class JSONEditor extends React.Component {


    onChange() {
        let cb = this.props.onChange;
        if (cb) {
            cb(this.editor.get());
        }
    }

    componentDidMount() {
        let options = {
            modes: [ 'tree', 'code' ],
            onChange: this.onChange.bind(this)
        };
        this.editor = new Editor(this.editorDomElement, options);
        this.editor.set(this.props.state || {});
    }

    onReset() {
        if (this.props.onReset)
            this.props.onReset();
        this.editor.set(this.props.state || {});
    }

    render() {
        return (
            <div className={styles}>
                <RaisedButton
                    className="button"
                    label="Reset"
                    onClick={this.onReset.bind(this)}
                    secondary={true}
                />
                <div className="editor" ref={(el) => this.editorDomElement = el}>
                </div>
            </div>
        )
    }

}