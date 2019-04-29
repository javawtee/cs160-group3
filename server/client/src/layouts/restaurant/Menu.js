import React, { Component } from 'react'
import { TextField } from '@material-ui/core';

const initialMenu = (initialAmount) => {
   return { 
    menu: [
        {
            category: "Hot food",
            id: 1, 
            name: "Hot Food 1",
            price: "1.99",
            amount: initialAmount,
        },
        {
            category: "Hot food",
            id: 2, 
            name: "Hot Food 2",
            price: "21.99",
            amount: initialAmount,
        },
        {
            category: "Fastfood",
            id: 3, 
            name: "Fastfood 1",
            price: "3.99",
            amount: initialAmount,
        },
        {
            category: "Fastfood",
            id: 4, 
            name: "Fastfood 1",
            price: "11.99",
            amount: initialAmount,
        },
        {
            category: "Beverage",
            id: 5, 
            name: "Coke",
            price: "0.99",
            amount: initialAmount,
        },
        {
            category: "Beverage",
            id: 6, 
            name: "Pepsi",
            price: "0.99",
            amount: initialAmount,
        },
        {
            category: "Alcohol",
            id: 7, 
            name: "Beer",
            price: "7.99",
            amount: initialAmount,
        },
        {
            category: "Beverage",
            id: 8, 
            name: "Wine",
            price: "14.99",
            amount: initialAmount,
        },
    ]
 }
}

export class Menu extends Component {
    constructor(props){
        super(props);
        this.state = initialMenu(0);
    }

    componentWillReceiveProps = () => {
        //console.log("asdf " + this.props.resetMenu);
        if(this.props.resetMenu){
            this.setState(initialMenu(0))
        }
    }

    updateOrder = (e) => {
        const newMenu = this.state.menu;
        const targetId = Number(e.target.id) -1;
        newMenu[targetId].amount = e.target.value;
        this.setState({menu: newMenu})
        this.props.updateOrder(newMenu[targetId]);
    }

    renderMenu = () => {
        const menuListing = this.state.menu.map((element, id) =>
            <tr key={id}>
                <td style={{maxWidth: "30px"}}>
                    <TextField id={element.id.toString()} value={element.amount} onChange={this.updateOrder}
                        style={element.amount > 0 ? {background:"#78a3e8"} : {}} onFocus={(e) => e.target.select()}
                    />
                </td>
                <td className="text-truncate" style={{minWidth: "20vw", maxWidth:"20vw", paddingLeft: "20px"}}
                    data-toggle="tooltip" data-placement="bottom" title={element.name}
                >
                    &nbsp;{element.name}
                </td>
                <td>&nbsp;{element.price}</td>
            </tr>
        );
        return (
            <div className="col">
                <table>
                    <tbody>
                        <tr>
                            <th>&nbsp;</th>
                            <th style={{paddingLeft: "20px"}}>Name</th>
                            <th>Price</th>
                        </tr>
                        {menuListing}
                    </tbody>
                </table>
            </div>
        );
    }

  render() {
    return (
      <div className="container" style={{padding: "25px 85px 25px 25px", minWidth: "25vw"}}>
        <div className="row border">
            <div className="col" style={{background:"#c96310", color:"white"}}>MENU</div>
        </div>
        <div className="row border border-top-0 pt-1 pb-2 overflow-auto" style={{maxHeight: "65vh"}}>
            {this.renderMenu()}
        </div>
      </div>
    )
  }
}

export default Menu
