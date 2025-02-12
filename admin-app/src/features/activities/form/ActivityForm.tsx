import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Header, Segment } from "semantic-ui-react";
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ActivityFormValues } from '../../../app/models/activity';
import MyDateInput from '../../../app/common/form/MyDateInput';
import MySelectInput from '../../../app/common/form/MySelectInput';
import MyTextAreaInput from '../../../app/common/form/MyTextArea';
import MyTextInput from '../../../app/common/form/MyTextInput';
import { categoryOptions } from '../../../app/common/options/categoryOptions';
import LocationPicker from '../../../app/util/LocationPicker';


export default observer(function ActivityForm() {
    const { activityStore } = useStore();
    const { createActivity, updateActivity, loadActivity, deleteActivity, loadingInitial } = activityStore;
    const { id } = useParams();
    const navigate = useNavigate();

    const [activityState, setActivityState] = useState<ActivityFormValues>(new ActivityFormValues());
    const [requiresPayment, setRequiresPayment] = useState(false);
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const validationSchema = Yup.object({
        title: Yup.string().required('The event title is required'),
        category: Yup.string().required('The event category is required'),
        description: Yup.string().required(),
        date: Yup.string().required('Date is required').nullable(),
        venue: Yup.string().required(),
        // Optional validation for latitude and longitude
        latitude: Yup.number().nullable(),
        longitude: Yup.number().nullable(),
    });

    useEffect(() => {
        if (id) {
            loadActivity(id).then(activity => {
                if (activity) {
                    setActivityState(new ActivityFormValues(activity));
                    setRequiresPayment(activity.requiresPayment);
                    // Set initial coordinates
                    setLatitude(activity.latitude);
                    setLongitude(activity.longitude);
                }
            });
        }
    }, [id, loadActivity]);

    function handleFormSubmit(activity: ActivityFormValues) {
        const updatedActivity = {
            ...activity,
            requiresPayment,
            latitude: latitude ?? 0,
            longitude: longitude ?? 0,
        };

        if (!activity.id) {
            const newActivity = {
                ...updatedActivity,
                id: uuid()
            };
            createActivity(newActivity).then(() => navigate(`/activities/${newActivity.id}`));
        } else {
            updateActivity(updatedActivity).then(() => navigate(`/activities/${activity.id}`));
        }
    }

    function handleDeleteActivity() {
        if (id) {
            deleteActivity(id).then(() => navigate('/activities'));
        }
    }

    if (loadingInitial) return <LoadingComponent content='Loading activity...' />;

    return (
        <Segment clearing>
            <Header content='Activity Details' sub color='teal' />
            <Formik
                enableReinitialize
                validationSchema={validationSchema}
                initialValues={activityState}
                onSubmit={values => handleFormSubmit(values)}>
                {({ handleSubmit, isValid, isSubmitting, dirty }) => (
                    <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                        <MyTextInput name='title' placeholder='Title' />
                        <MyTextAreaInput rows={3} name='description' placeholder='Description' />
                        <MySelectInput options={categoryOptions} name='category' placeholder='Category' />
                        <MyDateInput name='date' placeholderText='Date' showTimeSelect timeCaption='time' dateFormat='MMMM d, yyyy h:mm aa' />

                        <Header content='Location Details' sub color='teal' />
                        <MyTextInput name='venue' placeholder='Venue' />
                        <MyTextInput name='city' placeholder='City' />

                        {/* Include the LocationPicker */}
                        <LocationPicker
                            onLocationSelect={(lat, lng) => {
                                setLatitude(lat);
                                setLongitude(lng);
                            }}
                        />

                        {/* Ticket Details */}
                        <MyTextInput name='ticketPrice' placeholder='Ticket Price' type='number' />
                        <MyTextInput name='ticketQuantityAvailable' placeholder='Ticket Quantity Available' type='number' />
                        <label>
                            <input
                                type='checkbox'
                                checked={requiresPayment}
                                onChange={(e) => setRequiresPayment(e.target.checked)}
                            />
                            Requires Payment
                        </label>

                        <Button disabled={isSubmitting || !dirty || !isValid} loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
                        <Button as={Link} to='/activities' floated='right' type='button' content='Cancel' />

                        {/* Delete button, visible only if editing an existing activity */}
                        {id && (
                            <Button
                                floated='left'
                                type='button'
                                color='red'
                                content='Delete'
                                onClick={handleDeleteActivity}
                            />
                        )}
                    </Form>
                )}
            </Formik>
        </Segment>
    );
});
