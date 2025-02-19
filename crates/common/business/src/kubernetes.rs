// Copyright 2022 BaihaiAI, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#[allow(unreachable_code)]
pub fn cluster_header_k8s_svc() -> String {
    if !is_k8s() {
        return "127.0.0.1".to_string();
    }
    let hostname = os_utils::get_hostname();
    let (region, team_id) = get_region_team_id_from_hostname(&hostname);
    if hostname.contains("raycluster") {
        format!("idp-raycluster-{region}-{team_id}-ray-head")
    } else {
        format!("idp-develop-{region}-{team_id}-svc")
    }
}

fn get_region_team_id_from_hostname(hostname: &str) -> (String, String) {
    let mut parts = hostname.split('-').skip(2);
    let region = parts.next().unwrap();
    let team_id = parts.next().unwrap();
    (region.to_string(), team_id.to_string())
}

#[test]
fn test_get_region_team_id_from_hostname() {
    assert_eq!(
        get_region_team_id_from_hostname("idp-kernel-b-1586198890356670464-22227-job-0"),
        ("b".to_string(), "1586198890356670464".to_string())
    );
    assert_eq!(
        get_region_team_id_from_hostname("idp-kernel-a-executor-22227-job-0"),
        ("a".to_string(), "executor".to_string())
    );
}

#[cfg(test)]
fn cluster_header_k8s_svc_inner(hostname: &str) -> String {
    let mut parts = hostname.rsplit('-').skip(3).collect::<Vec<_>>();
    parts.reverse();
    parts.push("head");
    parts.join("-")
}

#[test]
fn test_cluster_header_k8s_svc_inner() {
    assert_eq!(
        cluster_header_k8s_svc_inner("idp-raycluster-b-1546774368495616000-ray-worker-type-tswnj"),
        "idp-raycluster-b-1546774368495616000-ray-head"
    )
}
pub fn is_k8s() -> bool {
    // FIXME why our supervisor in k8s pod not contains this env but kubectl exec /bin/bash contains this env
    // std::env::var("KUBERNETES_SERVICE_HOST").is_ok()
    std::path::Path::new("/var/run/secrets/kubernetes.io").exists()
}
