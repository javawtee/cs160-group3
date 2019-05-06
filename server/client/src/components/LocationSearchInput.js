import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import isValidZip from "./SantaClaraValidZips";
 
export class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      address: this.props.presetValue || "", // props.presetValue from UserInformation.js
      valid: false, // prevent abusing api
     };
  }

  componentWillReceiveProps = nextProps => {
    if(nextProps.revert && nextProps.revert === true){
      // accessible only from Restaurant's UserInformation
      this.setState({address: nextProps.presetValue, valid: false}, 
        () => {
          // revert geocode to the last address
          this.checkAddress(this.state.address)
        });
    }
    if(nextProps.resetPlaceOrder && nextProps.resetPlaceOrder === true){
      // accessible only from Restaurant's PlaceOrder
      this.setState({address: "", valid: false})
    }
  }
 
  handleChange = address => {
    this.setState({address});
  };

  handleOnBlur = address => {
    if(typeof(address) === "string"){
      // onSelect action
      this.setState({address}, () => this.checkAddress(address));
    } else if(!this.state.valid && this.state.address.length > 0) {
      this.checkAddress(this.state.address);
    }
  }

  checkAddress = address => {
    geocodeByAddress(address)
    .then(results => {
      // addressComponents.length > 9 when building name is included (San Jose Eye Institue, 123, Di Salvo...)
      var addressComponents = results.length === 0 || results[0].address_components; 
      if(addressComponents !== 0){
        addressComponents.forEach(comp => {
          if(comp.types[0] === "postal_code"){
            if(isValidZip(Number(comp.long_name))){
              this.setState({valid: true}, () => {
                if(this.props.updateRestaurantAddress){
                // save new geocode for restaurant's session after updating
                  getLatLng(results[0]).then(res => {
                    var latitude = res.lat;
                    var longitude = res.lng;
                    var userSession = JSON.parse(sessionStorage.getItem("user-token"));
                    // geocode is defined in componentWillMount of RestaurantConsole
                    userSession.geocode = {latitude, longitude}
                    sessionStorage.setItem("user-token", JSON.stringify(userSession));
                  });
                }  
                this.props.setAddress({result:"success", address})
              })
            } else {
              this.setState({valid: false}, () => {
                this.props.setAddress({result:"failure"})
              })
            }
          }
        })
      } else {
        this.setState({valid: false}, () => {
          this.props.setAddress({result:"failure"})
        })
      }
    })
    .catch(() => {
      this.setState({valid: false}, () => {
        this.props.setAddress({result:"failure"})
      })
    });
  }
 
  render() {
      const {address} = this.state;
      const {toggleError} = this.props;
    return (
      <PlacesAutocomplete
        value={address}
        onChange={this.handleChange}
        onSelect={this.handleOnBlur}
        //shouldFetchSuggestions={this.state.address.length > 1}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
            {...getInputProps({
                type:"text",
                style:toggleError,
                className: "form-control text-left text-truncate",
                autoComplete: "new-password",
                datatoggle: "tooltip",
                dataplacement: "bottom",
                title:address,
                onBlur:this.handleOnBlur,
                readOnly: this.props.isReadOnly || false, // props.isReadOnly from UserInformation.js
            })}
            />
            <div className="dropdown border rounded " style={{lineHeight:"1.5", borderWidth: "3px"}}>
              {loading && <div>Loading...</div>}
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: '#a8aaad', cursor: 'pointer' , fontSize: "1.3vw"}
                  : { backgroundColor: '#ffffff', cursor: 'pointer' , fontSize: "1.3vw"};
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <span>{suggestion.description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

export default LocationSearchInput