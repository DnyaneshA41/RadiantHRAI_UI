
import axiosClientModule from "../../../api/axiosClientModule";

export const getOrganisationListApi = async () => {
  const response = await axiosClientModule.get(
    "/Organization/GetOrganisationList"
  );

  return response.data;
};
