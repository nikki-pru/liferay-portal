/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 */

import {debounce} from 'frontend-js-web';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {bindAll} from '../utils/utils';
import w from '../utils/window';

class InfiniteScroll extends Component {
	constructor(props) {
		super(props);

		bindAll(this, 'handleScroll_', 'shouldScroll_');

		this.debouncedScrollHandler_ = debounce(this.handleScroll_, props.wait);
	}

	componentDidMount() {
		this.attachScrollHandler_();

		if (this.props.hasMoreResults) {
			this.debouncedScrollHandler_();
		}
	}

	componentWillUnmount() {
		if (this._request) {
			this._request.cancel();
		}

		this.debouncedScrollHandler_.cancel();

		this.detachScrollHandler_();
	}

	attachScrollHandler_(forceAttach) {
		const {attachToElement, hasMoreResults} = this.props;

		if (hasMoreResults || forceAttach) {
			attachToElement().addEventListener(
				'scroll',
				this.debouncedScrollHandler_
			);
		}
	}

	detachScrollHandler_() {
		this.props
			.attachToElement()
			.removeEventListener('scroll', this.debouncedScrollHandler_);
	}

	handleScroll_() {
		const {onScrollEnd} = this.props;

		if (!this.state.loading_ && onScrollEnd && this.shouldScroll_()) {
			this.setState({loading_: true});

			this._request = onScrollEnd().then(() => {
				this.setState({loading_: false});
			});
		}
	}

	shouldScroll_() {
		let shouldScroll = false;

		const scrollContainer = this.element;

		if (scrollContainer && scrollContainer.offsetParent) {
			shouldScroll =
				scrollContainer.getBoundingClientRect().bottom -
					w.innerHeight -
					this.props.scrollOffset <
				0;
		}

		return shouldScroll;
	}

	syncHasMoreResults(value) {
		if (value) {
			this.attachScrollHandler_(value);
		}
		else {
			this.debouncedScrollHandler_.cancel();

			this.detachScrollHandler_();
		}
	}

	render() {
		return <div>{this.props.children}</div>;
	}
}

InfiniteScroll.defaultProps = {
	attachToElement: () => w,
	hasMoreResults: true,
	loading_: false,
	scrollOffset: 0,
	wait: 100,
};

InfiniteScroll.propTypes = {
	attachToElement: PropTypes.func,
	hasMoreResults: PropTypes.bool,
	onScrollEnd: PropTypes.func,
	scrollOffset: PropTypes.number,
	wait: PropTypes.number,
};

export default InfiniteScroll;
