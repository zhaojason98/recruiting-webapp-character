import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';

const DEFAULT_ATTRIBUTE = ATTRIBUTE_LIST.reduce((obj, v) => ({...obj, [v]: 0}), {});
const DEFAULT_CLASS_COND = Object.keys(CLASS_LIST).reduce((obj, v) => ({...obj, [v]: false}), {});
const DEFAULT_POINTS = SKILL_LIST.reduce((obj, k) => ({...obj, [k.name]: 0}), {});

const URL = 'https://recruiting.verylongdomaintotestwith.ca/api/zhaojason98/character';
function App() {

  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTE);
  const [selectedClass, setClass] = useState(null);
  const [classConditions, setConditions] = useState(DEFAULT_CLASS_COND);
  const [points, setPoints] = useState(DEFAULT_POINTS);

  const SELECTED_CLASS = CLASS_LIST[selectedClass];

  const spentPoints = Object.values(points).reduce((curr, v) => curr + v, 0);
  const modifiers = Object.entries(attributes).reduce((obj, [k, v]) => ({
    ...obj,
    [k]: Math.floor(v/2 - 5)
  }), {})
  const intelligence = modifiers['Intelligence'] > 0 ? 10 + modifiers['Intelligence'] * 4 : 10
  const availablePoints = intelligence - spentPoints;

  const saveData = useCallback(() => {
    const currData = JSON.stringify({
      attr: attributes,
      points: points,
    });
    const blob = new Blob([currData], {type: "application/json"});
    fetch(URL, {
      method: 'POST',
      headers: {
        "Content-type": "application/json"
      },
      body: blob,
    });
  }, [attributes, points])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(URL);
      const data = await res.json();
      const body = data.body;
      if (!!body && !!body.attr) {
        setAttributes(body.attr);
      }
      if (!!body && !!body.points) {
        setPoints(body.points);
      }
      // Default is {message: 'Item not found'}
    }
    fetchData();
  }, [])

  useEffect(() => {
    // Save data to api on unmount
    saveData();
  }, [saveData])

  useEffect(() => {
    let newConditions = Object.keys(classConditions).reduce((obj, k) => ({
      ...obj,
      [k]: isMet(k)
    }), {});
    setConditions(newConditions);
  }, [attributes])

  const onAttrInc = (attr) => {
    const totalAttr = Object.values(attributes).reduce((curr, v) => curr + v, 0);
    if (totalAttr <= 70) {
      setAttributes({
        ...attributes,
        [attr]: attributes[attr] + 1,
      });
    }
  }

  const onAttrDec = (attr) => {
    setAttributes({
      ...attributes,
      [attr]: attributes[attr] = 1,
    });
  }

  const onSkillInc = (skill) => {
    if (availablePoints > 0) {
      setPoints({
        ...points,
        [skill]: points[skill] + 1
      })
    }
  }

  const onSkillDec = (skill) => {
    if (points[skill] > 0) {
      setPoints({
        ...points,
        [skill]: points[skill] - 1
      })
    }
  }

  const isMet = (cn) => {
    const ca = CLASS_LIST[cn];
    let met = true;
    Object.entries(attributes).forEach(([key, val]) => {
      if (val < ca[key]) {
        met = false;
      }
    })

    return met;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
      </header>
      <section className="App-section">
        <div className="classBody">
          <div className="classlist">
            <h2>Classes</h2>
            {Object.keys(CLASS_LIST).map(cn => (
              <div 
                className="cn"
                onClick={() => setClass(cn)}
                style={{color: classConditions[cn] ? 'red' : 'white'}}
              >
                {cn}
              </div>
            ))}
          </div>
        </div>
        {!!SELECTED_CLASS && (
          <div className="classDescription">
            <h4>{`${selectedClass} Attributes:`}</h4>
              <div>
                {Object.keys(SELECTED_CLASS).map(classAttr => (
                  <div className="classAttribute">
                    {`${classAttr}: ${SELECTED_CLASS[classAttr]}`}
                  </div>
                ))}
              </div>
          </div>
        )}
        <div className="attributesBody">
          <h2>Character Attributes</h2>
          {ATTRIBUTE_LIST.map(attr => (
            <div className="attribute">
              {`${attr}: ${attributes[attr]}`}
              <div className="horizontal-spacer" />
              <button onClick={() => onAttrInc(attr)}>+</button>
              <div className="horizontal-spacer" />
              <button onClick={() => onAttrDec(attr)}>-</button>
            </div>
          ))}
        </div>
        <div className="skillsBody">
          <h2>Skills</h2>
          <h4>{`Available Points: ${availablePoints}`}</h4>
          {SKILL_LIST.map(skill => (
            <div className="skills">
              <div>{`${skill.name} - points: ${points[skill.name]}`}</div>
              <div className="horizontal-spacer" />
              <button onClick={() => onSkillInc(skill.name)}>+</button>
              <div className="horizontal-spacer" />
              <button onClick={() => onSkillDec(skill.name)}>-</button>
              <div className="horizontal-spacer" />
              <div>{`modifier (${skill.attributeModifier}): ${modifiers[skill.attributeModifier]}`}</div>
              <div className="horizontal-spacer" />
              <div>{`Total: ${points[skill.name] + modifiers[skill.attributeModifier]}`}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
