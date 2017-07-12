import React from 'react';
import { styles } from './styles.scss';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuButton from '../MenuButton';
import TimelineSlider from '../TimelineSlider';

export default class TweakUI extends React.Component {

    state = {
        visible: false
    }

    onToggleUI() {
        this.setState({visible: !this.state.visible});
    }

    render() {
        return (
            <MuiThemeProvider>
                <div>
                    <MenuButton onClick={this.onToggleUI.bind(this)}/>
                    <div className={styles} ref={(ui) => { this.ui = ui; }} style={{display: this.state.visible ? 'block' : 'none'}}>
                        {this.props.children}
                    </div>
                </div>
            </MuiThemeProvider>
        )
    }

}