/**
 * Licensed to Jasig under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Jasig licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.jasig.ssp.util.csvwriter;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.ScrollableResults;
import org.jasig.ssp.model.PersonSearchResult2;
import org.jasig.ssp.service.reference.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import au.com.bytecode.opencsv.CSVWriter;

public class CaseloadCsvWriterHelper extends AbstractCsvWriterHelper<PersonSearchResult2> {

	private static String[] colHeaders = new String[16];
	
	private static String COL_PERSON_ID = "PERSON_ID";
	private static String COL_SCHOOL_ID = "SCHOOL_ID";
	private static String COL_FIRST_NAME = "FIRST_NAME";
	private static String COL_MIDDLE_NAME = "MIDDLE_NAME";
	private static String COL_LAST_NAME = "LAST_NAME";
	private static String COL_BIRTH_DATE = "BIRTH_DATE";
	private static String COL_STUDENT_TYPE_NAME = "STUDENT_TYPE";
	private static String COL_CURRENT_APPOINTMENT_START_TIME = "CURRENT_APPOINTMENT_START_TIME";
	private static String COL_STUDENT_INTAKE_COMPLETE_DATE = "STUDENT_INTAKE_COMPLETE_DATE";
	private static String COL_ACTIVE_ALERTS = "ACTIVE_ALERTS";
	private static String COL_CLOSED_ALERTS = "CLOSED_ALERTS";
	private static String COL_NUM_EARLY_ALERT_RESPONSES_REQUIRED = "NUM_EARLY_ALERT_RESPONSES_REQUIRED";
	private static String COL_COACH_FIRST_NAME = "COACH_FIRST_NAME";
	private static String COL_COACH_LAST_NAME = "COACH_LAST_NAME";
	private static String COL_CURRENT_PROGRAM_STATUS = "CURRENT_PROGRAM_STATUS";
	private static String COL_START_TERM = "START_TERM";
	
	static {
		colHeaders[0] = COL_PERSON_ID;
		colHeaders[1] = COL_SCHOOL_ID;
		colHeaders[2] = COL_FIRST_NAME;
		colHeaders[3] = COL_MIDDLE_NAME;
		colHeaders[4] = COL_LAST_NAME;
		colHeaders[5] = COL_BIRTH_DATE;
		colHeaders[6] = COL_STUDENT_TYPE_NAME;
		colHeaders[7] = COL_CURRENT_APPOINTMENT_START_TIME;
		colHeaders[8] = COL_STUDENT_INTAKE_COMPLETE_DATE;
		colHeaders[9] = COL_ACTIVE_ALERTS;
		colHeaders[10] = COL_CLOSED_ALERTS;
		colHeaders[11] = COL_NUM_EARLY_ALERT_RESPONSES_REQUIRED;
		colHeaders[12] = COL_COACH_FIRST_NAME;
		colHeaders[13] = COL_COACH_LAST_NAME;
		colHeaders[14] = COL_CURRENT_PROGRAM_STATUS;
		colHeaders[15] = COL_START_TERM;
	}

	public CaseloadCsvWriterHelper(PrintWriter writer) {
		super(writer);
	}

	@Override
	protected String[] csvHeaderRow() {
		return colHeaders;
	}

	@Override
	protected String[] csvBodyRow(PersonSearchResult2 model) {
		List<String> row = new ArrayList<String>();
		row.add(formatUuid(model.getPersonId()));
		row.add(model.getSchoolId());
		row.add(model.getFirstName());
		row.add(model.getMiddleName());
		row.add(model.getLastName());
		row.add(formatDate(model.getBirthDate()));
		row.add(model.getStudentTypeName());
		row.add(formatDate(model.getCurrentAppointmentStartTime()));
		row.add(formatDate(model.getStudentIntakeCompleteDate()));
		row.add(formatInt(model.getActiveAlerts()));
		row.add(formatInt(model.getClosedAlerts()));
		row.add(formatInt(model.getNumberEarlyAlertResponsesRequired()));
		row.add(model.getActualStartTerm());
		return row.toArray(new String[row.size()]);
	}

}
