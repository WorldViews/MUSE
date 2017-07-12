import React from 'react';
import { styles } from './styles.scss';
import RaisedButton from 'material-ui/RaisedButton';
import Slider from 'material-ui/Slider';
import FontIcon from 'material-ui/FontIcon';

import Icon from 'react-icons-kit';
import { ic_play_arrow } from 'react-icons-kit/md/ic_play_arrow';
import { ic_pause } from 'react-icons-kit/md/ic_pause';
import { ic_stop } from 'react-icons-kit/md/ic_stop';

export default class TimelineSlider extends React.Component {

    state = {
        timeText: '0000',
        yearText: '????',
    }

    set value(val) {
        this.slider.state.value = val;
    }

    get value() {
        return this.slider.state.value;
    }

    set timeText(val) {
        this.setState({timeText: val});
    }

    get timeText() {
        return this.state.timeText;
    }

    set yearText(val) {
        this.setState({yearText: val});
    }

    get yearText() {
        return this.state.yearText;
    }

    onValueChange(event) {
        switch (event.message.name) {
        case 'timeText':
            this.timeText = event.message.value;
            break;

        case 'yearText':
            this.yearText = event.message.value;
            break;
        }
    }

    componentDidMount() {
        this.onValueChangeListener = this.onValueChange.bind(this);
        game.events.addEventListener('valueChange', this.onValueChangeListener);
    }

    componentWillUnmount() {
        game.events.removeEventListener('valueChange', this.onValueChangeListener)
    }

    render() {
        return <div className={styles}>
            <div className="info">
                Time: {this.state.timeText} Year: {this.state.yearText}
            </div>
            <table>
                <tbody>
                    <tr>
                        <td width="260px">
                            <RaisedButton
                                className="button"
                                primary={true}
                                label="Play/Pause"
                                onClick={(e) => this.props.onPlayerButtonClick('playpause')}
                                icon={<Icon icon={ic_play_arrow} size={16} style={{color: 'white'}}/>}
                            />
                            <RaisedButton
                                className="button"
                                secondary={true}
                                label="Stop"
                                onClick={(e) => this.props.onPlayerButtonClick('stop')}
                                icon={<Icon icon={ic_stop} size={16} style={{color: 'white'}}/>}
                            />
                        </td>
                        <td>
                            <Slider
                                ref={(slider) => this.slider = slider}
                                className="slider"
                                onChange={this.props.onSliderChange}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    }
}