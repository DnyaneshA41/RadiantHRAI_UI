import axiosClientModule from "../../../api/axiosClientModule";

export const getOrganisationListApi = async () => {
  const response = await axiosClientModule.get(
    "/Entity/GetAllEntity"
  );

  return response.data;
};
