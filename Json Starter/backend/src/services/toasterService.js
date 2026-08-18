import { IDEA_NAME, state, addEvent } from '../data/toaster.js';

const BREAD_TYPES = ['white', 'wheat', 'rye', 'sourdough', 'bagel', 'brioche'];

function getInfo() {
  return {
    ideaName: IDEA_NAME,
    currentEra: state.currentEra,
    isToasting: state.isToasting,
    supportedBreadTypes: BREAD_TYPES,
  };
}

function toast(breadType) {
  state.isToasting = true;
  const message = `Toasting ${breadType} bread in ${state.currentEra}...`;
  state.isToasting = false;

  return addEvent('toast', {
    breadType,
    era: state.currentEra,
    message,
  });
}

function travelThroughTime(date) {
  const previousEra = state.currentEra;
  state.currentEra = date;
  const message = `Traveling back in time to ${date}...`;

  return addEvent('time-travel', {
    fromEra: previousEra,
    toEra: date,
    message,
  });
}

export { BREAD_TYPES, getInfo, toast, travelThroughTime };
