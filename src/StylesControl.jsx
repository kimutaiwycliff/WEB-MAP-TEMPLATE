import { useState, useEffect } from 'react';
import { fromJS } from 'immutable';

export const categories = ['labels', 'roads', 'buildings', 'parks', 'water', 'background'];

const layerSelector = {
  background: /background/,
  water: /water/,
  parks: /park/,
  buildings: /building/,
  roads: /bridge|road|tunnel/,
  labels: /label|place|poi/
};

const colorClass = {
  line: 'line-color',
  fill: 'fill-color',
  background: 'background-color',
  symbol: 'text-color'
};

export const StyleControls = ({ currentBasemap, onChange }) => {
  const [defaultStyle, setDefaultStyle] = useState(null);
  const [visibility, setVisibility] = useState({
    water: true,
    parks: true,
    buildings: true,
    roads: true,
    labels: true,
    background: true
  });

  const [color, setColor] = useState({
    water: '#DBE2E6',
    parks: '#E6EAE9',
    buildings: '#c0c0c8',
    roads: '#ffffff',
    labels: '#78888a',
    background: '#EBF0F0'
  });

  // Load the default style when basemap changes
  useEffect(() => {
    if (currentBasemap?.url) {
      fetch(currentBasemap.url)
        .then(res => res.json())
        .then(style => {
          setDefaultStyle(fromJS(style));
          // Reset visibility and colors when basemap changes
          setVisibility({
            water: true,
            parks: true,
            buildings: true,
            roads: true,
            labels: true,
            background: true
          });
        });
    }
  }, [currentBasemap]);

  // Generate the modified style when settings change
  useEffect(() => {
    if (!defaultStyle) return;

    const modifiedLayers = defaultStyle.get('layers')
      .filter(layer => {
        const id = layer.get('id');
        return categories.every(name => visibility[name] || !layerSelector[name].test(id));
      })
      .map(layer => {
        const id = layer.get('id');
        const type = layer.get('type');
        const category = categories.find(name => layerSelector[name].test(id));
        if (category && colorClass[type]) {
          return layer.setIn(['paint', colorClass[type]], color[category]);
        }
        return layer;
      });

    const modifiedStyle = defaultStyle.set('layers', modifiedLayers).toJS();
    onChange(modifiedStyle);
  }, [defaultStyle, visibility, color, onChange]);

  const onColorChange = (name, value) => {
    setColor(prev => ({...prev, [name]: value}));
  };

  const onVisibilityChange = (name, value) => {
    setVisibility(prev => ({...prev, [name]: value}));
  };

  return (
    <div className="control-panel">
      <h3>Layer Styling</h3>
      <p>Customize map layers and colors</p>
      <hr />
      {categories.map(name => (
        <div key={name} className="input">
          <label>{name}</label>
          <input
            type="checkbox"
            checked={visibility[name]}
            onChange={evt => onVisibilityChange(name, evt.target.checked)}
          />
          <input
            type="color"
            value={color[name]}
            disabled={!visibility[name]}
            onChange={evt => onColorChange(name, evt.target.value)}
          />
        </div>
      ))}
    </div>
  );
};
