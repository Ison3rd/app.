import React from 'react'
import { clsx } from 'clsx'

const RoleBadge = ({ role, className = '' }) => {
  const getRoleStyle = (role) => {
    const roleStyles = {
      'Animation Producer': 'role-producer',
      'Animation Director': 'role-director',
      'Senior 3D Animator': 'role-senior',
      'Intermediate 3D Animator': 'role-intermediate',
      'Junior 3D Animator': 'role-junior',
      'Concept Artist': 'role-artist',
      'Storyboard Artist': 'role-artist',
      'Character Designer': 'role-artist',
      'Environment Artist': 'role-artist',
      'VFX Artist': 'role-artist',
      'Motion Graphics Artist': 'role-artist',
      'Lighting Artist': 'role-artist',
      'Texture Artist': 'role-artist',
      'Compositor': 'role-artist',
      'Technical Director': 'role-technical',
      'Sound Designer': 'role-technical',
      'Editor': 'role-technical',
      'Rigger': 'role-technical',
      'Modeler': 'role-technical',
      'Previz Artist': 'role-technical',
    }
    return roleStyles[role] || 'role-junior'
  }

  const getShortRole = (role) => {
    const shortRoles = {
      'Animation Producer': 'Producer',
      'Animation Director': 'Director',
      'Senior 3D Animator': 'Sr. Animator',
      'Intermediate 3D Animator': 'Animator',
      'Junior 3D Animator': 'Jr. Animator',
      'Concept Artist': 'Concept',
      'Storyboard Artist': 'Storyboard',
      'Character Designer': 'Character',
      'Environment Artist': 'Environment',
      'VFX Artist': 'VFX',
      'Motion Graphics Artist': 'Motion',
      'Lighting Artist': 'Lighting',
      'Texture Artist': 'Texture',
      'Compositor': 'Comp',
      'Technical Director': 'Tech Dir',
      'Sound Designer': 'Sound',
      'Editor': 'Editor',
      'Rigger': 'Rigger',
      'Modeler': 'Modeler',
      'Previz Artist': 'Previz',
    }
    return shortRoles[role] || role
  }

  return (
    <span className={clsx('role-badge', getRoleStyle(role), className)}>
      {getShortRole(role)}
    </span>
  )
}

export default RoleBadge