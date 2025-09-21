import axios from "axios";

// set the default base URL from your .env
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

export default axios;
