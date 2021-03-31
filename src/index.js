import React from 'react'
import ReactDOM from 'react-dom';
import DragLayout from './drag_layout/index.js'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
  
    return (
        <DragLayout 
          boxSource={[
            {id:"a", title:"A点我拖拽修改位置", width:12, height:2, top:0, left:0, render:<div>这里是A，右下角可以改大小</div>},
            {id:"b", title:"B点我拖拽修改位置", width:12, height:2, top:2, left:0, render:<div>这里是B，右下角可以改大小</div>}
          ]}
          // layoutWidth={1000}
        />
    )
  }
}
export default App;


ReactDOM.render(
  <App />,
  document.getElementById('root')
)
