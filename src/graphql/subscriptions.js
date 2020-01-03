export const onCreateSampleAppsyncTable = `subscription OnCreateSampleAppsyncTable($group: String) {
    onCreateSampleAppsyncTable(group : $group) {
        group
        path
    }
}
`;
