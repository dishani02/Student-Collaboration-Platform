import * as XLSX from 'xlsx';

/**
 * Exports group assignment data to an Excel file (.xlsx)
 * @param {Object} project - The project/groupTable object (module, title, etc.)
 * @param {Array} groups - The list of groups with their members
 */
export const exportGroupsToExcel = (project, groups) => {
  if (!project || !groups || !groups.length) {
    console.error('No data to export');
    return;
  }

  // Flatten the data for the sheet
  const rows = [];
  
  // Sort groups by group number
  const sortedGroups = [...groups].sort((a, b) => a.groupNumber - b.groupNumber);

  sortedGroups.forEach((group) => {
    const groupName = `Group ${String.fromCharCode(64 + group.groupNumber)}`;
    
    if (group.members && group.members.length > 0) {
      group.members.forEach((member) => {
        rows.push({
          'Group': groupName,
          'Student Name': member.user?.fullName || member.name || '—',
          'Student ID': member.user?.studentId || member.studentId || '—',
          'Email': member.user?.email || member.email || '—',
          'Phone': member.user?.phone || member.phone || '—',
          'Role': member.isLeader ? 'Leader' : 'Member',
          'Join Method': member.joinMethod || '—'
        });
      });
    } else {
      rows.push({
        'Group': groupName,
        'Student Name': '(Empty)',
        'Student ID': '—',
        'Email': '—',
        'Phone': '—',
        'Role': '—',
        'Join Method': '—'
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups');

  const wscols = [
    { wch: 10 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 }
  ];
  worksheet['!cols'] = wscols;

  const filename = `${project.module}_${project.assignmentTitle.replace(/[^a-z0-9]/gi, '_')}_Groups.xlsx`;
  XLSX.writeFile(workbook, filename);
};
