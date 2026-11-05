import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit, faTrash, faPlus, faEye, faSearch, faDownload, faSave, faTimes,
   faCheck, faFilter, faRefresh, faFileExport, faBuilding, faUser, 
   faEnvelope, faPhone, faCalendar, faUpload, faArrowLeft, faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import "./Icons.css";

// Reusable icon components with automatic CSS classes

export const EditIcon = ({ className = "", ...props }) => (
  <FontAwesomeIcon
    {...props}
    icon={faEdit}
    className={`hrms-icon edit-icon ${className}`.trim()}
  />
);

export const DeleteIcon = (props) => (
  <FontAwesomeIcon
    icon={faTrash}
    className={`hrms-icon delete-icon ${props.className || ""}`}
    {...props}
  />
);

export const AddIcon = (props) => (
  <FontAwesomeIcon
    icon={faPlus}
    className={`hrms-icon add-icon ${props.className || ""}`}
    {...props}
  />
);

export const ViewIcon = (props) => (
  <FontAwesomeIcon
    icon={faEye}
    className={`hrms-icon view-icon ${props.className || ""}`}
    {...props}
  />
);

export const SearchIcon = (props) => (
  <FontAwesomeIcon
    icon={faSearch}
    className={`hrms-icon search-icon ${props.className || ""}`}
    {...props}
  />
);

export const DownloadIcon = (props) => (
  <FontAwesomeIcon
    icon={faDownload}
    className={`hrms-icon download-icon ${props.className || ""}`}
    {...props}
  />
);

export const SaveIcon = (props) => (
  <FontAwesomeIcon
    icon={faSave}
    className={`hrms-icon save-icon ${props.className || ""}`}
    {...props}
  />
);

export const CloseIcon = (props) => (
  <FontAwesomeIcon
    icon={faTimes}
    className={`hrms-icon close-icon ${props.className || ""}`}
    {...props}
  />
);

export const CheckIcon = (props) => (
  <FontAwesomeIcon
    icon={faCheck}
    className={`hrms-icon check-icon ${props.className || ""}`}
    {...props}
  />
);

export const FilterIcon = (props) => (
  <FontAwesomeIcon
    icon={faFilter}
    className={`hrms-icon filter-icon ${props.className || ""}`}
    {...props}
  />
);

export const RefreshIcon = (props) => (
  <FontAwesomeIcon
    icon={faRefresh}
    className={`hrms-icon refresh-icon ${props.className || ""}`}
    {...props}
  />
);

export const ExportIcon = (props) => (
  <FontAwesomeIcon
    icon={faFileExport}
    className={`hrms-icon export-icon ${props.className || ""}`}
    {...props}
  />
);

export const OrganizationIcon = (props) => (
  <FontAwesomeIcon
    icon={faBuilding}
    className={`hrms-icon organization-icon ${props.className || ""}`}
    {...props}
  />
);

export const UserIcon = (props) => (
  <FontAwesomeIcon
    icon={faUser}
    className={`hrms-icon user-icon ${props.className || ""}`}
    {...props}
  />
);

export const EmailIcon = (props) => (
  <FontAwesomeIcon
    icon={faEnvelope}
    className={`hrms-icon email-icon ${props.className || ""}`}
    {...props}
  />
);

export const PhoneIcon = (props) => (
  <FontAwesomeIcon
    icon={faPhone}
    className={`hrms-icon phone-icon ${props.className || ""}`}
    {...props}
  />
);

export const CalendarIcon = (props) => (
  <FontAwesomeIcon
    icon={faCalendar}
    className={`hrms-icon calendar-icon ${props.className || ""}`}
    {...props}
  />
);

export const UploadIcon = (props) => (
  <FontAwesomeIcon
    icon={faUpload}
    className={`hrms-icon upload-icon ${props.className || ""}`}
    {...props}
  />
);

export const BackIcon = (props) => (
  <FontAwesomeIcon
    icon={faArrowLeft}
    className={`hrms-icon back-icon ${props.className || ""}`}
    {...props}
  />
);

export const NextIcon = (props) => (
  <FontAwesomeIcon
    icon={faArrowRight}
    className={`hrms-icon next-icon ${props.className || ""}`}
    {...props}
  />
);
