import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import SubHeader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Utils from './Utils';
import FlatButton from 'material-ui/FlatButton';
import IconRooms from 'material-ui-icons/Home';
import IconButton from 'material-ui/IconButton';
import IconFunctions from 'material-ui-icons/LightbulbOutline'
import IconFavorites from 'material-ui-icons/Favorite'
const styles = {
    iconsSelected: {
        backgroundColor: 'rgb(204, 204, 204)',
        color: 'white'
    }
};

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
    return class SelectableList extends Component {
        static propTypes = {
            children: PropTypes.node.isRequired,
            defaultValue: PropTypes.string.isRequired,
        };
        constructor(props) {
            super(props);
            this.state = {
                selectedIndex: this.props.defaultValue
            };
            this.defaultValue = this.props.defaultValue;
        }

        componentDidUpdate () {
            if (this.defaultValue !== this.props.defaultValue) {
                this.defaultValue = this.props.defaultValue;
                this.setState({
                    selectedIndex: this.props.defaultValue,
                });
            }
        }

        componentWillMount() {
            this.setState({
                selectedIndex: this.props.defaultValue,
            });
        }

        handleRequestChange = (event, index) => {
            this.setState({
                selectedIndex: index,
            });
        };

        render() {
            return (
                <ComposedComponent
                    value={this.state.selectedIndex}
                    onChange={this.handleRequestChange}
                >
                    {this.props.children}
                </ComposedComponent>
            );
        }
    };
}

SelectableList = wrapState(SelectableList);

class MenuList extends React.Component {
    static propTypes = {
        objects: PropTypes.object.isRequired,
        selectedId: PropTypes.string,
        root: PropTypes.string.isRequired,
        onSelectedItemChanged: PropTypes.func.isRequired,
        onRootChanged: PropTypes.func.isRequired
    };

    getListHeader() {
        let name = Utils.getObjectName(this.props.objects, this.props.root);

        let items = this.getElementsToShow('enum');

        if (name) {
            return (<SubHeader>{
                items.map(item => {
                    if (this.props.objects[item] && this.props.objects[item].common && this.props.objects[item].common.name) {
                        name = this.props.objects[item].common.name;
                    } else {
                        name = item.substring(5);
                        name = name[0].toUpperCase() + name.substring(1).toLowerCase();
                    }
                    if (item === 'enum.rooms') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : {}} tooltip={name}     onTouchTap={() => this.onRootChanged('enum.rooms')}><IconRooms /></IconButton>);
                    } else if (item === 'enum.functions') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : {}} tooltip={name}     onTouchTap={() => this.onRootChanged('enum.functions')}><IconFunctions /></IconButton>);
                    } else if (item === 'enum.favorites') {
                        return (<IconButton key={item} style={item === this.props.root ? styles.iconsSelected : {}} tooltip={name}     onTouchTap={() => this.onRootChanged('enum.favorites')}><IconFavorites /></IconButton>);
                    } else {
                        return (<FlatButton key={item} onTouchTap={() => this.onRootChanged(item)}>{name}</FlatButton>);
                    }
                })
            }</SubHeader>);
        } else {
            return '';
        }
    }

    onRootChanged(id) {
        let items = this.getElementsToShow(id);
        let page = items.find(id => {
            return this.props.objects[id] && this.props.objects[id].common && this.props.objects[id].common.members && this.props.objects[id].common.members.length
        });
        if (!page) {
            let pages = items.map(id => {
                let ids = this.getElementsToShow(id);
                return ids.find(id => {
                    return this.props.objects[id] && this.props.objects[id].common && this.props.objects[id].common.members && this.props.objects[id].common.members.length
                });
            });
            page = pages.find(id => pages[0]);
        }
        this.props.onRootChanged && this.props.onRootChanged(id, page);
    }

    getElementsToShow(root) {
        root = root || this.props.root;

        let objects   = this.props.objects;
        let items     = [];
        let reg       = root ? new RegExp('^' + root + '\\.') : new RegExp('^[^.]$');
        let rootParts = root.split('.');

        for (let id in objects) {
            if (objects.hasOwnProperty(id) && reg.test(id)) {
                let parts = id.split('.');
                parts.splice(rootParts.length + 1);
                id = parts.join('.');
                if (items.indexOf(id) === -1) {
                    items.push(id);
                }
            }
        }
        return items;
    }

    static isOpened (path, id) {
        if (id === path.substring(0, id.length)) return true;
        return undefined;
    }

    getListItems(items) {
        if (!items) {
            items = this.getElementsToShow();
        } else
        if (typeof items !== 'object') {
            items = this.getElementsToShow(items);
        }
        //let objects = this.prop.objects;

        return items.map(id => (
            <ListItem
                key={id}
                value={id}
                open={MenuList.isOpened(this.props.selectedId, id)}
                primaryText={Utils.getObjectName(this.props.objects, id)}
                onClick={(el) => this.onSelected(id, el)}
                nestedItems={this.getListItems(id)}
            />
        ))
    }

    onSelected(id, el) {
        if (this.props.objects[id]) {
            this.props.onSelectedItemChanged && this.props.onSelectedItemChanged(id);
        }
    }

    getSelectedItem(items) {
        if (this.props.selectedId) {
            return this.props.selectedId;
        }
        items = items || this.getElementsToShow();
        return items[0] || '';
    }

    render() {
        let items = this.getElementsToShow();
        if (items && items.length) {
            return (
                <div>
                    <Divider />
                    {this.getListHeader()}
                    <Divider />
                    <SelectableList defaultValue={this.getSelectedItem(items)} >
                        {this.getListItems(items)}
                    </SelectableList>
                </div>
            );
        } else {
            return (
                <div>
                    <Divider />
                    {this.getListHeader()}
                    <Divider />
                    <SelectableList defaultValue="0" >
                        <ListItem key="0" primaryText="No elements" value="0" />
                    </SelectableList>
                </div>
            );
        }
    }
}

export default MenuList;