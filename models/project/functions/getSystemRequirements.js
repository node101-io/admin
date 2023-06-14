module.exports = data => {
    const system_requirements = {};

    if (!data || typeof data !== 'object')
        return system_requirements;

    if (data.cpu && typeof data.cpu === 'string')
        system_requirements.cpu = data.cpu.trim();
    if (data.ram && typeof data.ram === 'string')
        system_requirements.ram = data.ram.trim();
    if (data.storage && typeof data.storage === 'string')
        system_requirements.storage = data.storage.trim();
    if (data.os && typeof data.os === 'string')
        system_requirements.os = data.os.trim();

    return system_requirements;
}