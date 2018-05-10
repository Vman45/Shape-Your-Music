import React from 'react';
import CustomSelect from 'components/CustomSelect';
import PropTypes from 'prop-types';
import Knob from 'components/Knob';
import Button from 'components/Button';

import { ColorUtils } from 'utils/Utils';

import styles from './styles.css';

const propTypes = {
  color: PropTypes.string.isRequired,
  instNamesList: PropTypes.array.isRequired,
  synthParams: PropTypes.shape({
    name: PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
    baseSynth: PropTypes.func.isRequired,
    dynamicParams: PropTypes.array.isRequired,
    effects: PropTypes.array,
  }).isRequired,
  knobVals: PropTypes.array.isRequired,
  onKnobChange: PropTypes.func.isRequired,
  onInstChange: PropTypes.func.isRequired,
  onIncrementClick: PropTypes.func.isRequired,
};

function ColorControllerComponent (props) {
  const darkerColor = ColorUtils.getDarker(props.color);
  return (
    <div
      className={styles.colorController}
      style={{
        backgroundColor: props.color
      }}
    >
      <div
        className={styles.titleBar}
        style={{
          backgroundColor: darkerColor
        }}
      >
        <CustomSelect
          dropDownAlign="BottomLeft"
          color={props.color}
          name="Instrument Select"
          value={props.synthParams.name.value}
          options={props.instNamesList}
          onChange={props.onInstChange}
          synthParams={props.synthParams}
          instNamesList={props.instNamesList}
        />
        <Button 
          color={props.color}
          onClick={props.onIncrementClick(-1)}
        >
          <i className="ion-chevron-left" />
        </Button>
        <Button 
          color={props.color}
          onClick={props.onIncrementClick(1)}
        >
          <i className="ion-chevron-right" />
        </Button>
      </div>
      <div className={styles.knobsContainer}>
        {props.synthParams.dynamicParams.map((effect, i) => (
          <div key={`${props.color}-knob-${i}`} >
            <Knob
              // color={props.color}
              paramName={effect.name}
              value={props.knobVals[i]}
              onChange={props.onKnobChange(i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

ColorControllerComponent.propTypes = propTypes;

export default ColorControllerComponent;


// render () {
//   const color = this.props.colorsList[this.props.colorIndex];
//   const titleBackgroundColor = color;
//   const contentBackgroundColor = Color(color).lighten(0.1);
  
//   return (    
//     <li className="inst-option">
//       <div className="inst-title" style={{backgroundColor: titleBackgroundColor}}>
//         <div style={{width: '50%', backgroundColor: Color(color).darken(0.1)}}>
//           <Select
//             optionRenderer={option => (
//               <div style={{backgroundColor: titleBackgroundColor}}>
//                 {option.label}
//               </div>
//             )}
//             menuStyle={{
//               background: titleBackgroundColor
//             }}
//             className="inst-select"
//             searchable={true}
//             clearable={false}
//             name="Instrument Select"
//             value={this.props.synthParams.name.value}
//             options={this.props.instNamesList}
//             onChange={this.handleInstChange}
//           />
//           {/*<button className="show-hide show-hide-inst" data-target="inst-selectors" title="Show/Hide synth controls">
//             <i className="ion-arrow-left-b"></i>
//           </button>*/}
//         </div>
//       </div>
//       <ul
//         className="inst-params"
//         style={{
//           backgroundColor: contentBackgroundColor
//         }}
//       >
//         {this.props.synthParams.dynamicParams.map((effect, i) => (
//           <li key={i}>
//             <Knob
//               paramName={effect.name}
//               value={this.props.knobVals[i]}
//               onChange={this.handleParamValueChange(i)}
//             />
//           </li>
//         ))}
//       </ul>
//     </li>
//   );
// }