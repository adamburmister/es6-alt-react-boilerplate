```js
import alt from './alt';
import TodoActions from '../actions/TodoActions'

class TodoStore {
  constructor() {
    this.bindListeners({
      onUpdateTodo: TodoActions.UPDATE_TODO,
    });

    this.state = {
      todos: []
    };
  }

  onUpdateTodo(todo) {
    this.setState({ todos: this.state.todos.concat(todo) });
  }
}

export default alt.createStore(TodoStore, 'TodoStore');
```
