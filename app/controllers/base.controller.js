/* eslint-disable linebreak-style */
/* eslint-disable no-prototype-builtins */

class BaseController {
  filterParams(params, whitelist) {
    const filtered = {};
    for (const key in params) {
      if (whitelist.indexOf(key) > -1) {
        filtered[key] = params[key];
      }
    }
    return filtered;
  }


  parserBody(obj) {
    return JSON.parse(Object.keys(obj)[0]);
  }

  formatApiError(err) {
    if (!err) {
      // eslint-disable-next-line no-console
      return console.error('Provide an error');
    }

    const formatted = {
      message: err.message,
    };

    if (err.errors) {
      formatted.errors = {};
      const errors = err.errors;
      for (const type in errors) {
        if (errors.hasOwnProperty(type)) {
          formatted.errors[type] = errors[type].message;
        }
      }
    }

    return formatted;
  }
}

export default BaseController;
