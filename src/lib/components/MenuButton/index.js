import React from 'react';
import {styles} from './styles.scss';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Icon from 'react-icons-kit';
import { ic_menu } from 'react-icons-kit/md/ic_menu';

export default class MenuButton extends React.Component {

    render() {
        return (
            <div className={styles}>
                <FloatingActionButton onClick={this.props.onClick}>
                    <Icon icon={ic_menu}/>
                </FloatingActionButton>
            </div>
        )
    }

}