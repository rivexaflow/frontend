import * as icons from '@untitledui/icons';
const names = ['Lightning01', 'ShieldTick', 'BarChart10', 'Users01', 'CheckCircle', 'LayoutAlt02', 'File01'];
names.forEach(name => {
  console.log(`${name}: ${!!icons[name]}`);
});
