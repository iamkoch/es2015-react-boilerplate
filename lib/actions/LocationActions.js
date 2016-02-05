import AppDispatcher from '../dispatcher';
import SampleConstants from '../constants/LocationConstants';

export default class {
  create(term) {
    AppDispatcher.dispatch({
      actionType: SampleConstants.CREATE,
      term,
    });
  }

  destroy(id) {
    AppDispatcher.dispatch({
      actionType: SampleConstants.DESTROY,
      id,
    });
  }
}
