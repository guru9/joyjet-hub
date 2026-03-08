import { DeviceEventEmitter } from 'react-native';

class GlobalAlert {
  static show(title, message, type = 'danger') {
    DeviceEventEmitter.emit('show_cyber_alert', { title, message, type });
  }
}

export default GlobalAlert;
