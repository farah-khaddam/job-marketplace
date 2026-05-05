import axios from "axios";

const BASE_URL = "http://localhost:8000/api";


export const jobSeekerRegister = (data) =>
  axios.post(`${BASE_URL}/auth/job-seeker/register/`, data);

export const jobSeekerLogin = (data) =>
  axios.post(`${BASE_URL}/auth/job-seeker/login/`, data);


export const companyRegister = (data) =>
  axios.post(`${BASE_URL}/auth/company/register/`, data);

export const companyLogin = (data) =>
  axios.post(`${BASE_URL}/auth/company/login/`, data);