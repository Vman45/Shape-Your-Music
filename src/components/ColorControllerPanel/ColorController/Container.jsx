import React, { Component } from 'react';
import { string, array, func } from 'prop-types';
import Tone from 'tone';
import ColorControllerComponent from './Component';
import { SYNTH_PRESETS, ALL_SYNTHS } from 'instrumentPresets';
import { SEND_CHANNELS } from 'utils/music';

const propTypes = {
  color: string.isRequired,
  receiveChannel: string.isRequired,
  knobVals: array.isRequired,
  synthType: string.isRequired,
  onInstChange: func.isRequired,
  onKnobChange: func.isRequired,
};

const knobIndexChanged = (currVals, nextVals) => {
  for (var i = 0; i < currVals.length; i++) {
    if (currVals[i] !== nextVals[i]) {
      return i;
    }
  }
  return -1;
};

class ColorController extends Component {
  constructor(props) {
    super(props);
    const { synthType, receiveChannel } = props;
    const { effects } = SYNTH_PRESETS[synthType];

    this.fxList = [];
    this.fxBus = new Tone.Gain(0.8);
    this.fxBus.receive(receiveChannel);

    this.output = new Tone.Gain(1);
    this.output.send(SEND_CHANNELS.MASTER_OUTPUT, 0);
    this.connectEffects(effects);

    this.disposeEffects = this.disposeEffects.bind(this);

    this.handleInstChange = this.handleInstChange.bind(this);
    this.handleIncrementClick = this.handleIncrementClick.bind(this);
  }

  componentDidMount() {
    const { knobVals, synthType } = this.props;
    knobVals.forEach((val, i) => {
      this.triggerEffectCallback(SYNTH_PRESETS[synthType], i, val);
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Change instrument
    if (nextProps.synthType !== this.props.synthType) {
      const newSynth = SYNTH_PRESETS[nextProps.synthType];
      this.connectEffects(newSynth.effects);
      nextProps.knobVals.forEach((val, i) => {
        this.triggerEffectCallback(newSynth, i, val);
      });
    }

    // change knob effect
    const changedKnobIndex = knobIndexChanged(
      this.props.knobVals,
      nextProps.knobVals
    );
    if (!this.props.knobVals || changedKnobIndex >= 0) {
      const val = nextProps.knobVals[changedKnobIndex];
      const synth = SYNTH_PRESETS[nextProps.synthType];

      this.triggerEffectCallback(synth, changedKnobIndex, val);
    }
  }

  componentWillUnmount(nextProps, nextState) {
    this.disposeEffects();
    this.output.disconnect();
    this.output.dispose();
  }

  disposeEffects() {
    this.fxBus.disconnect();
    this.fxBus.dispose();
    if (this.fxList) {
      this.fxList.forEach(effect => {
        effect.disconnect();
        effect.dispose();
      });
      this.fxList = [];
    }
  }

  triggerEffectCallback(synth, knobIndex, val) {
    const targetParam = synth.dynamicParams[knobIndex];
    // change effect amount
    // synth parameters are handled by shapes
    if (targetParam.target === 'effect') {
      targetParam.func(this, val);
    }
  }

  // called by the callbacks in the synth object
  // TODO figure out better way?
  setEffectAmount(effectIndex, val, parameter) {
    this.fxList[effectIndex].set(parameter, val);
  }

  connectEffects(fxConstructors) {
    this.disposeEffects();

    this.fxBus = new Tone.Gain(0.8);
    this.fxBus.receive(this.props.receiveChannel);

    fxConstructors.forEach(fxObj => {
      const newEffect = fxObj.start
        ? new fxObj.type(fxObj.params).start()
        : new fxObj.type(fxObj.params);
      this.fxList.push(newEffect);
    });

    // TODO
    if (this.fxList.length === 3) {
      this.fxBus.chain(
        this.fxList[0],
        this.fxList[1],
        this.fxList[2],
        this.output
      );
    } else if (this.fxList.length === 2) {
      this.fxBus.chain(this.fxList[0], this.fxList[1], this.output);
    } else if (this.fxList.length === 1) {
      this.fxBus.chain(this.fxList[0], this.output);
    } else {
      this.fxBus.chain(this.output);
    }
  }

  handleInstChange(option) {
    if (option) {
      this.props.onInstChange(option.value);
    }
  }

  handleIncrementClick(difference) {
    return () => {
      const { synthType, onInstChange } = this.props;
      const numOptions = ALL_SYNTHS.length - 1;
      const currentIndex = ALL_SYNTHS.findIndex(
        ({ value }) => value === synthType
      );

      let nextVal = currentIndex + difference;

      if (nextVal > numOptions) nextVal = 0;
      if (nextVal < 0) nextVal = numOptions;

      onInstChange(ALL_SYNTHS[nextVal].value);
    };
  }

  render() {
    return (
      <ColorControllerComponent
        {...this.props}
        onInstChange={this.handleInstChange}
        onIncrementClick={this.handleIncrementClick}
      />
    );
  }
}

ColorController.propTypes = propTypes;

export default ColorController;
