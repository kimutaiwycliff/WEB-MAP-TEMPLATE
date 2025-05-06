import { CITIES } from "../public/constants";
const ControlPanel = ({onSelectCity}) => {
  return (
    <div className="control-panel">

      {CITIES.filter(city => city.state === 'California').map((city, index) => (
        <div key={`btn-${index}`} className="input">
          <input
            type="radio"
            name="city"
            id={`city-${index}`}
            defaultChecked={city.city === 'San Francisco'}
            onClick={() => onSelectCity(city)}
          />
          <label htmlFor={`city-${index}`}>{city.city}</label>
        </div>
      ))}
    </div>
  )
}

export const BasemapSwitcher = ({basemaps, currentBasemap, setCurrentBasemap}) => {
  return (
    <div className="basemap-switcher-horizontal">
    {basemaps.map((basemap) => (
      <button
        key={basemap.id}
        className={`basemap-btn ${currentBasemap.id === basemap.id ? 'active' : ''}`}
        onClick={() => setCurrentBasemap(basemap)}
      >
        {basemap.name}
      </button>
    ))}
  </div>
  )
}
export default ControlPanel
