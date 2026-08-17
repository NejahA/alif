import * as toasterService from '../services/toasterService.js';
import { getHistory as getHistoryData, clearHistory } from '../data/toaster.js';

function getInfo(req, res) {
  res.json({ data: toasterService.getInfo() });
}

function toastBread(req, res) {
  const { breadType } = req.body;
  const event = toasterService.toast(breadType);
  res.status(201).json({ data: event });
}

function travelThroughTime(req, res) {
  const { date } = req.body;
  const event = toasterService.travelThroughTime(date);
  res.status(201).json({ data: event });
}

function getHistory(req, res) {
  const { page, limit } = req.query;
  res.json(getHistoryData({ page, limit }));
}

function resetHistory(req, res) {
  clearHistory();
  res.status(204).send();
}

export { getInfo, toastBread, travelThroughTime, getHistory, resetHistory };
