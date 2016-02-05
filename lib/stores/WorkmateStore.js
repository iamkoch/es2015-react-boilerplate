import AppDispatcher from '../dispatcher';
import { EventEmitter } from 'events';
import LocationConstants from '../constants/LocationConstants';
import $ from 'jquery';
import uuid from 'node-uuid';

export default new class WorkmateStore extends EventEmitter {
  static ChangeEvent = 'change';
  _items = [];

  static create(name) {
    const newItem = {
      id: uuid.v4(),
      name,
    };

    WorkmateStore._items.items.push(newItem);

    return newItem;
  }

  static destroy(id) {
    const item = WorkmateStore._items.items.filter(x => x.id === id)[0];
    WorkmateStore._items.items.splice(WorkmateStore._items.items.indexOf(item), 1);
  }

  constructor() {
    super();
    this.initialize();
  }

  emitChange() {
    super.emit(WorkmateStore.ChangeEvent);
  }

  addChangeListener(callback) {
    super.on(WorkmateStore.ChangeEvent, callback);
  }

  removeChangeListener(callback) {
    super.removeListener(WorkmateStore.ChangeEvent, callback);
  }

  initialize() {
    $.ajax({
      url: '/api/items',
      type: 'get',
      success: items => {
        this._items = items;
        this.emitChange();
      },
    });

    this.dispatcherIndex = AppDispatcher.register(action => {
      let item;

      switch (action.actionType) {
        case LocationConstants.CREATE:
          item = action.item.trim();
          if (!!item) {
            const t = this.create(item);
            $.ajax({
              url: '/api/items',
              type: 'post',
              contentType: 'application/json',
              data: JSON.stringify(t),
              success: () => this.emitChange(),
            });
          }
          break;

        case LocationConstants.DESTROY:
          $.ajax({
            url: `/api/items/${action.id}`,
            type: 'delete',
            success: items => {
              this._items = items;
              this.emitChange();
            },
          });
          this.emitChange();
          break;
        default:

      }

      return true;
    });
  }

  getAll() {
    return this._items;
  }
};
