import { ExceptionCode } from "../types/ExceptionCode"

export const PNC_UPDATE_ERROR_CODES = {
  ADJOURN_PRE_JUDGE_PNC_HAS_ADJ: ExceptionCode.HO200100,
  ADJOURN_WITH_JUDGE_PNC_HAS_ADJ: ExceptionCode.HO200101,
  ADJOURN_POST_JUDGE_PNC_HAS_NO_ADJ: ExceptionCode.HO200103,
  JUDGE_WITH_RESULT_PNC_HAS_ADJ: ExceptionCode.HO200104,
  SENTENCE_PNC_HAS_NO_ADJ: ExceptionCode.HO200106,
  APPEAL_PNC_HAS_NO_ADJ: ExceptionCode.HO200107,
  INSUFFICIENT_RCC_INFO: ExceptionCode.HO200108,
  INVALID_OPERATION_SEQUENCE: ExceptionCode.HO200109,
  NON_POLICE_DUMMY_ASN: ExceptionCode.HO200110,
  UNKNOWN_ORDER_VARIED_REVOKED: ExceptionCode.HO200111,
  NEW_DISP_AND_SENTENCING: ExceptionCode.HO200112,
  NEW_REMAND_AND_SENTENCING: ExceptionCode.HO200113,
  DISP_CHANGED_AND_SENTENCING: ExceptionCode.HO200114,
  NEW_AND_CHANGED_DISP: ExceptionCode.HO200115,
  TOO_MANY_OFFENCES_PRESENT: ExceptionCode.HO200116,
  TOO_MANY_RESULTS_PRESENT: ExceptionCode.HO200117,
  NO_UPDATES_RESULTS_IGNORED: ExceptionCode.HO200118,
  SCHEMA_MISMATCH: ExceptionCode.HO200119,
  NO_REINSTATEMENT_DATE: ExceptionCode.HO200120,
  ALL_OFFENCES_EXCLUDED: ExceptionCode.HO200121,
  SENTENCE_CHANGED_ON_APPEAL: ExceptionCode.HO200122,
  INVALID_PTIURN: ExceptionCode.HO100201,
  APPEAL_AGAINST_SENTENCE_NO_NEW_SENTENCE: ExceptionCode.HO200123,
  ADJ_AND_FINAL_RESULTS: ExceptionCode.HO200124,
  DISPOSAL_TEXT_TOO_LONG: ExceptionCode.HO200200,
  RESULT_QUALIFIER_DURATION_PRESENT: ExceptionCode.HO200201,
  TOO_MANY_RESULT_QUALIFIERS_PRESENT: ExceptionCode.HO200202,
  TOO_MANY_BAIL_CONDITIONS_PRESENT: ExceptionCode.HO200203,
  AMOUNT_SPECIFIED_IN_RESULT_TOO_LARGE: ExceptionCode.HO200205,
  TOO_MANY_RESULTS_PRESENT_WARNING: ExceptionCode.HO200209,
  SENTENCE_PNC_HAS_ADJ: ExceptionCode.HO200210,
  CROWN_COURT_RESULT_WITH_ADDED_OFFENCES: ExceptionCode.HO200211,
  NO_RESULTS_ERROR: ExceptionCode.HO200212
}
