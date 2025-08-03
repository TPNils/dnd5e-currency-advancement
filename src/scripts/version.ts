export class Version {
  
  constructor(
    public readonly major: number,
    public readonly minor?: number,
    public readonly patch?: number,
  ) {
  }

  public valueOf() {
    const parts = [this.major, this.minor ?? 0, this.patch ?? 0];
    return parts.map(part => String(part).padStart(20, '0')).join('.');
  }

  public equals(value: any): boolean {
    if (!(value instanceof Version)) {
      return false;
    }

    return this.major === value.major && (this.minor ?? 0) === (value.minor ?? 0) && (this.patch ?? 0) === (value.patch ?? 0);
  }

  public toString(): string {
    const parts = [this.major];
    if (this.minor != null) {
      parts.push(this.minor);
    }
    if (this.patch != null) {
      parts.push(this.patch);
    }
    return parts.join('.');
  }

  public static fromString(versionString: string): Version {
    let version = /^v?([0-9]+)(?:\.([0-9]+))?(?:\.([0-9]+))?$/i.exec(versionString);
    if (!version) {
      throw new Error('Unsupported version format');
    }

    const versionData = {major: 0, minor: undefined, patch: undefined};
    versionData.major = Number.parseInt(version[1]);
    versionData.minor = Number.parseInt(version[2]);
    versionData.patch = Number.parseInt(version[3]);
    return new Version(versionData.major, versionData.minor, versionData.patch);
  }

}