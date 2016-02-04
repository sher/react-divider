import c from 'classnames/dedupe';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

class ReactDivider extends Component {
  constructor(props) {
    super(props);

    this.resizeStart = this.resizeStart.bind(this);

    this.initial = {
      sideA: { width: null, height: null, minWidth: null, minHeight: null },
      sideB: { width: null, height: null, minWidth: null, minHeight: null }
    };
  }

  getClassNames() {
    return c({
      'ui-divider': true,
      'ui-divider--vertical': this.props.vertical,
      'ui-divider--horizontal': !this.props.vertical,
      'ui-divider--fixed': this.props.fixed,
      'ui-divider--resizable': !this.props.fixed
    });
  }

  getNodes() {
    const divider = ReactDOM.findDOMNode(this);
    const container = divider.parentElement;
    const sideA = divider.previousElementSibling;
    const sideB = divider.nextElementSibling;

    return {
      container,
      sideA,
      sideB
    };
  }

  getStyles() {
    const { container, sideA, sideB } = this.getNodes();

    const containerStyle = window.getComputedStyle(container, null);
    const sideAStyle = window.getComputedStyle(sideA, null);
    const sideBStyle = window.getComputedStyle(sideB, null);

    return {
      containerStyle,
      sideAStyle,
      sideBStyle
    };
  }

  getComputedSize(style, property) {
    return new Size(style.getPropertyValue(property));
  }

  getDeclaredSize(side, property) {
    const value = side.style.getPropertyValue(property);
    return value ? new Size(value) : null;
  }

  overlay() {
    let div = document.createElement('div');
        div.className = c({
          'ui-divider-overlay': true,
          'ui-divider-overlay--vertical': this.props.vertical,
          'ui-divider-overlay--horizontal': !this.props.vertical
        });
    return document.body.appendChild(div);
  }

  resizeStart(e) {
    e.preventDefault();

    const { container, sideA, sideB } = this.getNodes();
    const { containerStyle, sideAStyle, sideBStyle } = this.getStyles();

    const initial = this.initial;
    const snap = this.props.snap;
    const x = e.clientX - container.offsetLeft;
    const y = e.clientY - container.offsetTop;
    const containerWidth = this.getComputedSize(containerStyle, 'width');
    const containerHeight = this.getComputedSize(containerStyle, 'height');
    const sideAWidth = this.getComputedSize(sideAStyle, 'width');
    const sideBWidth = this.getComputedSize(sideBStyle, 'width');
    const totalWidth = sideAWidth.add(sideBWidth.value);
    const sideAHeight = this.getComputedSize(sideAStyle, 'height');
    const sideBHeight = this.getComputedSize(sideBStyle, 'height');
    const totalHeight = sideAHeight.add(sideBHeight.value);
    const overlay = this.overlay();

    const bounds = this.props.vertical ? {
      left: initial.sideA.minWidth.value - sideAWidth.value,
      right: sideBWidth.value - initial.sideB.minWidth.value
    } : {
      top: initial.sideA.minHeight.value - sideAHeight.value,
      bottom: sideBHeight.value - initial.sideB.minHeight.value
    };

    function resizeVertical(e) {
      const deltaX = e.clientX - x - container.offsetLeft;
      if (deltaX < bounds.left || deltaX > bounds.right) return;

      let sideANewWidth = sideAWidth.add(deltaX);
      let sideBNewWidth = sideBWidth.add(-deltaX);

      if (initial.sideA.minWidth.add(snap).gt(sideANewWidth)) {
        sideANewWidth = initial.sideA.minWidth;
        sideBNewWidth = totalWidth.add(-sideANewWidth.value);
      }

      if (initial.sideB.minWidth.add(snap).gt(sideBNewWidth)) {
        sideBNewWidth = initial.sideB.minWidth;
        sideANewWidth = totalWidth.add(-sideBNewWidth.value);
      }

      sideA.style.width = sideA.style.maxWidth = initial.sideA.width ? sideANewWidth.toPc(containerWidth) : null;
      sideB.style.width = sideB.style.maxWidth = initial.sideB.width ? sideBNewWidth.toPc(containerWidth) : null;
    }

    function resizeHorizontal(e) {
      const deltaY = e.clientY - y - container.offsetTop;
      if (deltaY < bounds.top || deltaY > bounds.bottom) return;

      let sideANewHeight = sideAHeight.add(deltaY);
      let sideBNewHeight = sideBHeight.add(-deltaY);

      if (initial.sideA.minHeight.add(snap).gt(sideANewHeight)) {
        sideANewHeight = initial.sideA.minHeight;
        sideBNewHeight = totalHeight.add(-sideANewHeight.value);
      }

      if (initial.sideB.minHeight.add(snap).gt(sideBNewHeight)) {
        sideBNewHeight = initial.sideB.minHeight;
        sideANewHeight = totalHeight.add(-sideBNewHeight.value);
      }

      sideA.style.height = sideA.style.maxHeight = initial.sideA.height ? sideANewHeight.toPc(containerHeight) : null;
      sideB.style.height = sideB.style.maxHeight = initial.sideB.height ? sideBNewHeight.toPc(containerHeight) : null;
    }

    function resizeEnd(e) {
      e.preventDefault();
      document.body.removeChild(overlay);
      document.removeEventListener('mouseup', resizeEnd);
      document.removeEventListener('mousemove', resize);
      window.dispatchEvent(new Event('resize'));
    }

    const resize = this.props.vertical ? resizeVertical : resizeHorizontal;

    document.addEventListener('mouseup', resizeEnd);
    document.addEventListener('mousemove', resize);
  }

  setInitialSizes() {
    const { sideA, sideB } = this.getNodes();

    if (this.props.vertical) {
      this.initial.sideA.width = this.getDeclaredSize(sideA, 'width');
      this.initial.sideB.width = this.getDeclaredSize(sideB, 'width');
      this.initial.sideA.minWidth = this.getDeclaredSize(sideA, 'min-width') || new Size(this.props.min);
      this.initial.sideB.minWidth = this.getDeclaredSize(sideB, 'min-width') || new Size(this.props.min);

      if (!this.initial.sideA.width) {
        sideA.className = c(sideA.className, 'ui-divider-section--greedy');
      }

      if (!this.initial.sideB.width) {
        sideB.className = c(sideB.className, 'ui-divider-section--greedy');
      }
    }
    else {
      this.initial.sideA.height = this.getDeclaredSize(sideA, 'height');
      this.initial.sideB.height = this.getDeclaredSize(sideB, 'height');
      this.initial.sideA.minHeight = this.getDeclaredSize(sideA, 'min-height') || new Size(this.props.min);
      this.initial.sideB.minHeight = this.getDeclaredSize(sideB, 'min-height') || new Size(this.props.min);

      if (!this.initial.sideA.height) {
        sideA.className = c(sideA.className, 'ui-divider-section--greedy');
      }

      if (!this.initial.sideB.height) {
        sideB.className = c(sideB.className, 'ui-divider-section--greedy');
      }
    }
  }

  componentDidMount() {
    const { container, sideA, sideB } = this.getNodes();

    container.className = c(container.className, {
      'ui-divider-container': true,
      'ui-divider-container--vertical': this.props.vertical,
      'ui-divider-container--horizontal': !this.props.vertical
    });

    sideA.className = c(sideA.className, 'ui-divider-section');
    sideB.className = c(sideB.className, 'ui-divider-section');

    setTimeout(() => this.setInitialSizes(), 100);
  }

  render() {
    return (
      this.props.fixed ?
        <div className={this.getClassNames()} /> :
        <div className={this.getClassNames()} onMouseDown={this.resizeStart} />
    );
  }
}

ReactDivider.propTypes = {
  vertical: PropTypes.bool.isRequired,
  fixed: PropTypes.bool.isRequired,
  snap: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired
};

ReactDivider.defaultProps = {
  vertical: false,
  fixed: false,
  snap: 15,
  min: 20
};

export default ReactDivider;

class Size {
  constructor(str) {
    const parsed = this.parse(str);
    this.value = parsed.value;
    this.unit = parsed.unit;
  }

  parse(str) {
    const value = parseFloat(str) || 0;
    const match = String(str).trim().match(/(px|\%)$/i);
    const unit = match ? match[1] : 'px';

    return {
      value,
      unit
    };
  }

  toString() {
    return `${this.value}${this.unit}`;
  }

  add(value) {
    return new Size(`${this.value + value}${this.unit}`);
  }

  gt(size) {
    return this.value > size.value;
  }

  toPc(size) {
    const p = this.value * 100 / size.value;
    return new Size(`${p}%`);
  }
}
