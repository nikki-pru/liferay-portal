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

import '@testing-library/jest-dom/extend-expect';
import {act, cleanup, fireEvent, render} from '@testing-library/react';
import EditAppContext from 'app-builder-web/js/pages/apps/edit/EditAppContext.es';
import React, {useState} from 'react';

import ApplyAppChangesModal from '../../../../src/main/resources/META-INF/resources/js/pages/apps/edit/ApplyAppChangesModal.es';

const ContainerMock = ({children}) => {
	const [isAppChangesModalVisible, setAppChangesModalVisible] = useState(
		true
	);

	return (
		<EditAppContext.Provider
			value={{isAppChangesModalVisible, setAppChangesModalVisible}}
		>
			{children}
		</EditAppContext.Provider>
	);
};

describe('ApplyChangesModal', () => {
	const mockOnSave = jest.fn().mockImplementation((callback) => callback());

	afterEach(cleanup);

	beforeAll(() => {
		jest.useFakeTimers();
	});

	it('Sets its own visibility on closing', async () => {
		const {getByText} = render(
			<ApplyAppChangesModal onSave={mockOnSave} />,
			{
				wrapper: ContainerMock,
			}
		);

		act(() => {
			jest.runAllTimers();
		});

		const cancelButton = getByText('cancel');

		await fireEvent.click(cancelButton);

		act(() => {
			jest.runAllTimers();
		});

		expect(cancelButton).not.toBeInTheDocument();
	});

	it('Sets its own visibility on closing', async () => {
		const {getByText} = render(
			<ApplyAppChangesModal onSave={mockOnSave} />,
			{
				wrapper: ContainerMock,
			}
		);

		act(() => {
			jest.runAllTimers();
		});

		const saveButton = getByText('save');

		await fireEvent.click(saveButton);

		act(() => {
			jest.runAllTimers();
		});

		expect(saveButton).not.toBeInTheDocument();
	});
});
