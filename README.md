# Drag-Layout

## 概述
    基于react完成的一个插件，拖拽修改页面布局。核心代码在src/drag_layout/index.js。

## demo

[demo](https://13526628721.github.io/drag-layout/dist/index)

## 下载后项目启动
```bash
# install dependencies
npm install
# Start the service
npm run start
# build for development 
npm run dev
# build for production 
npm run umd
```

## 提供参数
```js
    boxSource array 要排列的盒子的数据源  [{id, title, width, height, top, left, render}]
        id,
        title
        width,  1～12 代表格数， 整个宽包括12个格和11个固定margin
        height, >=1 每个单位一代表固定尺寸
        top 0～11 横轴上每个单位等于当前宽度一个格加1个margin
        left >=0  纵轴上每个1代表一个固定高度加1个margin
        render 要渲染的内容
    uHeight number 单位高度 默认40 单位：像素
    uMargin number 单位边距 默认10 单位：像素
    layoutWidth number 布局总宽度,传宽度后将不会根据窗口大小自适应，不传获取父级页面宽度
    minHeight number 全部layout的最小高度
    onChangeBox function (boxSource) 修改布局后的回调，返回新的布局数据
```

## 本地安装引用
```js
    
    import DragLayout from '@/drag_layout/index.js'
    require("@/drag_layout/index.css)

    class App extends React.Component {
        return <div>
            <DragLayout 
                boxSource={[
                    {id:"a", title:"A点我拖拽修改位置", width:12, height:2, top:0, left:0, render:<div>这里是A，右下角可以改大小</div>},
                    {id:"b", title:"B点我拖拽修改位置", width:12, height:2, top:2, left:0, render:<div>这里是B，右下角可以改大小</div>}
                ]}
            />
        </div>
    }
```

