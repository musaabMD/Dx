// serverComponent.js
export async function fetchExamsData() {
    // Your fetch logic here
    try {
        const response = await fetch('your-api-endpoint');
        const data = await response.json();
        return { examsData: data, connectionError: null, examsError: null };
    } catch (error) {
        if (error.name === 'FetchError') {
            return { examsData: null, connectionError: error.message, examsError: null };
        } else {
            return { examsData: null, connectionError: null, examsError: error.message };
        }
    }
}
