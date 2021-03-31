import React, { useRef, useState, useEffect } from 'react';
require('./index.css');

function cloneObject (obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(cloneObject(obj[i]));
                }
            } else {
                o = {};
                for (var k in obj) {
                    if(k == "render") o[k] = obj[k];
                    else o[k] = cloneObject(obj[k]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}
function safeArray (arr) {
    if(arr instanceof Array) return arr
    return []
}
/**
 * 组件简介：
 * 仿照Prometheus写布局，宽度按比例自适应，可以缩放模块
 */
/**
 * @param {*} props 参数说明 
 * boxSource 要排列的盒子的数据源  [{id, title, width, height, top, left, render}]
 *    id,
 *    title
 *    width,  1～12 代表格数， 整个宽包括12个格和11个固定margin
 *    height, >=1 每个单位一代表固定尺寸
 *    top 0～11 横轴上每个单位等于当前宽度一个格加1个margin
 *    left >=0  纵轴上每个1代表一个固定高度加1个margin
 *    render 要渲染的内容
 * uHeight 单位高度 默认40 单位：像素
 * uMargin 单位边距 默认10 单位：像素
 * layoutWidth 布局总宽度,传宽度后将不会根据窗口大小自适应，不传获取父级页面宽度
 * minHeight 全部layout的最小高度 
 * onChangeBox (boxSource) 修改布局后的回调，返回新的布局数据
 */

/** state
 *  
 *  unitWidth   单位宽度
 *  shadowBox
 *  boxSource 数据源
 *  UNIT_HEIGHT 单位高度
 *  UNIT_MARGIN box之间间隔的宽度
 *  UNIT_Y : UNIT_HEIGHT + UNIT_MARGIN
 *  MAX_X_RULE: 页面宽度将被分为多少列 unitWidth = 页面宽度 / MAX_X_RULE 默认12
 *  MIN_HEIGHT 全部layout的最小高度， 小于页面高度，没有使用页面高度，
 *  layoutHeight 页面高度，根据最top+height计算出的最大值 单位：像素
 *  darg 当前拖拽的节点
 *  dargType 当前拖拽类型 move | scale
 *  mDCoordinate 被拖拽模块当前位置与目标位置的区别
 *  currentTime 时间戳，用于节流处理
 *  shadowBoxStyle 目标位置的阴影模块数据 {width, height, translate}
 */

function DragLayout (props) {
    const [shadowBox, setShadowBox] = useState(0);
    const [boxSource, setBoxSource] = useState(safeArray(props.boxSource,[]))
    const UNIT_HEIGHT = Number(props.uHeight) || 60;
    const UNIT_MARGIN = Number(props.uMargin) || 10;
    const UNIT_Y = UNIT_HEIGHT + UNIT_MARGIN;
    const MAX_X_RULE = 12;
    const [unitWidth, setUnitWidth] = useState(Number(props.layoutWidth) ? Math.floor((props.layoutWidth - UNIT_MARGIN * (MAX_X_RULE - 1)) / MAX_X_RULE) : 0);
    const MIN_HEIGHT = Number(props.minHeight) || window.innerHeight - 50;
    let layoutHeight = useRef(MIN_HEIGHT);
    let darg = useRef(null);
    let dargType = useRef(null);
    let mDCoordinate = useRef(null);
    let currentTime = useRef(null);
    let shadowBoxStyle = useRef(null);
    useEffect(() => {
        setBoxSource(onSortBoxSource(boxSource))
        if(Number(props.layoutWidth)) return;
        let width = document.getElementById("layout-grid").clientWidth;
        setUnitWidth(Math.floor((width - UNIT_MARGIN * (MAX_X_RULE - 1)) / MAX_X_RULE))

        window.onresize = function() {
            var target = this;
            if (target.resizeFlag) {
                clearTimeout(target.resizeFlag);
            }
            target.resizeFlag = setTimeout(function() {
                let width = document.getElementById("layout-grid").clientWidth;
                setUnitWidth(Math.floor((width - UNIT_MARGIN * (MAX_X_RULE - 1)) / MAX_X_RULE))
                target.resizeFlag = null;
            }, 100);
        }
    }, [])

    /**
    * 从上到下依次排开所有的box
    * @param {*} source 
    */
    const onSortBoxSource = (source) => {
        if (!source instanceof Array || source.length == 0) return [];
        source.sort((a, b) => a.top - b.top);
        /**
         * MAX_X_RULE 是 12，代表会把横轴分成12列
         * axis 的12个元素值代表每一列从上往下占用列y轴的第几行
         */
        let axis = new Array(MAX_X_RULE).fill(0);   //代表每一列当前被占用的最大值
        source.forEach(box => {
            let axisYs = []
            for (var x = 0; x < box.width; x++) {   //这里找出box的宽度下y轴都占用第几行了
                axisYs.push(axis[box.left + x])
            }
            axisYs.sort((a, b) => b - a);   //排序找出最大的，也就是最低的
            box.top = axisYs[0];    //box的高度位置在它下面

            for (var x = 0; x < box.width; x++) {
                axis[box.left + x] = axisYs[0] + box.height
            }
        })
        axis.sort((a, b) => b - a);
        layoutHeight.current = Math.max(MIN_HEIGHT, axis[0] * UNIT_Y);
        return source
    }

    const mouseDown = (event) => {
        const e = event || window.event;
        if (e.target.className == 'layout-grid-header') {
            dargType.current = "move";
            darg.current = e.target.parentNode;
            let transform = darg.current.style.transform || '';
            let [translateX, translateY] = transform.replace("translate(", "").replace(/px/g, "").replace(")", "").split(",");
            translateX = translateX || 0;
            translateY = translateY || 0;
            mDCoordinate.current = [e.clientX - translateX, e.clientY - translateY];
            shadowBoxStyle.current = {
                width: darg.current.style.width,
                height: darg.current.style.height,
                transform: `translate(${2 + Number(translateX)}px, ${2 + Number(translateY)}px)`,
                zIndex: true
            }

        } else if (e.target.className == 'layout-grid-angle') {
            dargType.current = "scale"
            darg.current = e.target.parentNode;
            let w = Number(darg.current.style.width.replace("px", ""))
            let h = Number(darg.current.style.height.replace("px", ""))
            mDCoordinate.current = [e.clientX - w, e.clientY - h]
            shadowBoxStyle.current = {
                width: darg.current.style.width,
                height: darg.current.style.height,
                transform: darg.current.style.transform,
                zIndex: true
            }

        } else {
            return;
        }
        darg.current.style.zIndex = 9;
        currentTime.current = new Date().getTime();

        setShadowBox(shadowBox + 1);
    }
    const mouseMove = (e) => {
        if (!darg.current || new Date().getTime() - currentTime.current < 50) return;
        currentTime.current = new Date().getTime();
        const event = e || window.event;
        let box = boxSource.find(item => item.id == darg.current.id);
        let [translateX, translateY] = mDCoordinate.current;
        let currentX = event.clientX - translateX,
            currentY = event.clientY - translateY;
            console.log("translateX::::::::::", translateX, translateY, currentX, currentY );
        if (dargType.current == "move") {
            currentX = Math.max(currentX, 0);
            currentX = Math.min(currentX, (unitWidth + UNIT_MARGIN) * (MAX_X_RULE - box.width));

            darg.current.style.transform = `translate(${currentX}px, ${currentY}px)`;
            let calibrationX = Math.round(currentX / (UNIT_MARGIN + unitWidth)),
                calibrationY = Math.round(currentY / UNIT_Y);
            // box置顶，空出shadowbox位置的方法，返回shadowbox的实际位置，datasource是否修改，修改后的datasource
            setDataAtTop(darg.current.id, [box.width, box.height, calibrationX, calibrationY], boxSource, (calibration, hasChange, source) => {
                let shadowtransform = `translate(${calibration[0] * (UNIT_MARGIN + unitWidth)}px, ${calibration[1] * UNIT_Y}px)`;
                if (!shadowBoxStyle.current || shadowtransform !== shadowBoxStyle.current.transform) {   //发现影子位置需要修改
                    shadowBoxStyle.current = {
                        width: darg.current.style.width,
                        height: darg.current.style.height,
                        transform: shadowtransform
                    }
                    setShadowBox(shadowBox + 1);
                }
                if (hasChange) {
                    setBoxSource(source);
                    if (props.onChangeBox) {
                        props.onChangeBox(source)
                    }
                }
            })
        } else if (dargType.current == "scale") {

            currentX = Math.max(currentX, unitWidth);
            currentY = Math.max(currentY, UNIT_HEIGHT);
            currentX = Math.min(currentX, (unitWidth + UNIT_MARGIN) * (MAX_X_RULE - box.left) - UNIT_MARGIN)
            darg.current.style.width = currentX + "px";
            darg.current.style.height = currentY + "px";
            let w = Math.round((currentX + UNIT_MARGIN) / (UNIT_MARGIN + unitWidth)),
                h = Math.round((currentY + UNIT_MARGIN) / UNIT_Y);
            setDataAtTop(darg.current.id, [w, h, box.left, box.top], boxSource, (calibration, hasChange, source) => {
                let shadowtransform = `translate(${calibration[0] * (UNIT_MARGIN + unitWidth)}px, ${calibration[1] * UNIT_Y}px)`;
                if (w != 0 || h != 0) {   //发现影子位置需要修改
                    shadowBoxStyle.current = {
                        width: w * unitWidth + (w - 1) * UNIT_MARGIN + "px",
                        height: h * UNIT_HEIGHT + (h - 1) * UNIT_MARGIN + "px",
                        transform: shadowtransform
                    }
                    setShadowBox(shadowBox + 1);
                }
                if (hasChange) {
                    setBoxSource(source)
                    if (props.onChangeBox) {
                        props.onChangeBox(source)
                    }
                }
            })
        }
    }
    const mouseUp = () => {
        if (darg.current){
            darg.current.style.zIndex = 0;
            darg.current.style.transform = shadowBoxStyle.current.transform;
        }
        shadowBoxStyle.current = null;
        darg.current = null;
        dargType.current = null;
        setShadowBox(0)
    }

    /**
     * 计算盒子置顶
     * @param {*} id 对照组id
     * @param {*} target 对照组需要的值 [w,h,left,top]
     * @param {*} source 
     * callback()
     *      calibration shadowbox实际的位置
     *      hasChange source是否修改
     *      source 修改后的source
     */

    const setDataAtTop = (id, target, dataSource, callback) => {
        let hasChange = false;
        let calibration = [target[2], target[3]];
        const idx = dataSource.findIndex(box => box.id == id);
        let box = cloneObject(dataSource[idx]);
        let source = [];
        if (idx == -1) {
            callback(calibration, hasChange, dataSource)
            return;
        } else if (idx == 0) {
            source = dataSource.slice(1)
        } else {
            source = [...dataSource.slice(0, idx), ...dataSource.slice(idx + 1)]
        }
        source.unshift({
            id: "-1",
            width: target[0],
            height: target[1],
            top: target[3],
            left: target[2]
        })
        source = onSortBoxSource(source);

        const shadowidx = source.findIndex(box => box.id == "-1");
        if (box.left != source[shadowidx].left || box.top != source[shadowidx].top || box.width != source[shadowidx].width || box.height != source[shadowidx].height) {
            hasChange = true;
            box.left = source[shadowidx].left;
            box.top = source[shadowidx].top;
            box.width = source[shadowidx].width;
            box.height = source[shadowidx].height;
        }
        source.splice(shadowidx, 1, box)
        calibration = [box.left, box.top]
        callback(calibration, hasChange, source)
    }


    return  <div
            className="layout-grid"
            id="layout-grid"
            style={{ height: layoutHeight.current + "px" }}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
            onMouseMove={mouseMove}
            onMouseLeave={mouseUp}
        >
            <div
                className="layout-gird-item-shadow"
                id="dragShadow"
                style={shadowBoxStyle.current ? { width: shadowBoxStyle.current.width, height: shadowBoxStyle.current.height, transform: shadowBoxStyle.current.transform, zIndex: shadowBoxStyle.current.zIndex ? -1 : 0 } : null}
            >
            </div>
            {boxSource.map(box => {
                if (!box.width || !box.height) { console.error("the box size (width or height) is not defined"); return; }
                const _width = box.width * unitWidth + (box.width - 1) * UNIT_MARGIN;
                const _height = box.height * UNIT_HEIGHT + (box.height - 1) * UNIT_MARGIN;
                const _unit_left = UNIT_MARGIN + unitWidth;
                return <div
                    key={box.id}
                    id={box.id}
                    className="layout-grid-item"
                    style={shadowBox != 0 && darg.current && darg.current.id == box.id ? { width: darg.current.style.width, height: darg.current.style.height, transform: darg.current.style.transform } : { width: _width + "px", height: _height + "px", transform: `translate(${box.left * _unit_left}px, ${box.top * (UNIT_Y)}px)` }}
                >
                    <div className="layout-grid-header">{box.title || ""}</div>
                    <div className="layout-grid-body" style={{ height: _height - 60 + "px" }}>{box.render || null}</div>
                    <div className="layout-grid-angle"></div>
                </div>
            })}
        </div>
}

export default DragLayout
